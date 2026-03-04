#!/bin/bash
set -e

# ──────────────────────────────────────────────────────────────
# declarative-dbdev-update.sh
#
# After editing declarative schema files, this script:
# 1. Starts a shadow DB (supabase/postgres image)
# 2. Applies the declarative schema to the shadow DB (desired state)
# 3. Diffs the running supabase DB against the shadow DB
# 4. Generates a migration file from the diff
# 5. Applies the migration to the supabase project DB
# 6. Verifies the roundtrip (expect 0 remaining changes)
#
# Run from the dbdev repo root so npx pgdelta resolves from node_modules:
#   MIGRATION_NAME=my_change bash scripts/declarative-dbdev-update.sh
# ──────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DBDEV_DIR="${DBDEV_DIR:-${SCRIPT_DIR}/..}"

SHADOW_IMAGE="${SHADOW_IMAGE:-supabase/postgres:15.8.1.085}"
SHADOW_CONTAINER="pgdelta-dbdev-shadow"
SHADOW_PORT="${SHADOW_PORT:-6544}"
SHADOW_URL="postgres://postgres:postgres@localhost:${SHADOW_PORT}/postgres"

SUPABASE_DB_PORT=54322
SUPABASE_DB_URL="postgres://postgres:postgres@localhost:${SUPABASE_DB_PORT}/postgres"

PGDELTA="${PGDELTA:-npx pgdelta}"
OUTPUT_DIR="${OUTPUT_DIR:-${DBDEV_DIR}/declarative-schemas}"
MIGRATION_NAME="${MIGRATION_NAME:-declarative_update}"
SKIP_APPLY="${SKIP_APPLY:-}"
SKIP_VERIFY="${SKIP_VERIFY:-}"

MIGRATIONS_DIR="${DBDEV_DIR}/supabase/migrations"

cleanup_shadow() {
  echo "Cleaning up shadow container..."
  docker rm -f "$SHADOW_CONTAINER" >/dev/null 2>&1 || true
}

# ──────────────────────────────────────────────────────────────
# 0. Pre-flight checks
# ──────────────────────────────────────────────────────────────
if [ ! -d "$OUTPUT_DIR" ]; then
  echo "Error: Declarative schema directory not found at ${OUTPUT_DIR}"
  echo "Run declarative-dbdev-init.sh first."
  exit 1
fi

echo "Checking supabase DB is reachable on port ${SUPABASE_DB_PORT}..."
if ! pg_isready -h localhost -p "$SUPABASE_DB_PORT" -U postgres 2>/dev/null; then
  echo "Error: Supabase DB is not running on port ${SUPABASE_DB_PORT}."
  echo "Start the dbdev project first: cd ${DBDEV_DIR} && supabase start"
  exit 1
fi

# ──────────────────────────────────────────────────────────────
# 1. Start shadow DB
# ──────────────────────────────────────────────────────────────
echo "Starting shadow DB (${SHADOW_IMAGE}) on port ${SHADOW_PORT}..."
docker rm -f "$SHADOW_CONTAINER" 2>/dev/null || true
docker run -d --name "$SHADOW_CONTAINER" \
  -e POSTGRES_PASSWORD=postgres \
  -p "${SHADOW_PORT}:5432" \
  "$SHADOW_IMAGE"

echo "Waiting for shadow DB to be ready..."
until docker exec "$SHADOW_CONTAINER" pg_isready -U postgres 2>/dev/null; do
  sleep 1
done
sleep 3

# ──────────────────────────────────────────────────────────────
# 2. Apply declarative schema to shadow DB (desired state)
# ──────────────────────────────────────────────────────────────
echo "Applying declarative schema to shadow DB..."
$PGDELTA declarative apply \
  --path "$OUTPUT_DIR" \
  --target "$SHADOW_URL" \
  --verbose

# ──────────────────────────────────────────────────────────────
# 3. Generate migration: diff supabase DB → shadow DB
# ──────────────────────────────────────────────────────────────
TIMESTAMP=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="${MIGRATIONS_DIR}/${TIMESTAMP}_${MIGRATION_NAME}.sql"
TMP_MIGRATION="/tmp/pgdelta-dbdev-migration-${TIMESTAMP}.sql"

echo "Generating migration (supabase DB → shadow DB)..."
rm -f "$TMP_MIGRATION"
PLAN_EXIT=0
$PGDELTA plan \
  --source "$SUPABASE_DB_URL" \
  --target "$SHADOW_URL" \
  --integration supabase \
  --format sql \
  --output "$TMP_MIGRATION" || PLAN_EXIT=$?

if [ "$PLAN_EXIT" -ne 0 ] && [ "$PLAN_EXIT" -ne 2 ]; then
  echo "Error: pgdelta plan failed with exit code ${PLAN_EXIT}"
  cleanup_shadow
  exit 1
fi

if [ "$PLAN_EXIT" -eq 0 ]; then
  echo ""
  echo "No changes detected. Declarative schema matches the supabase DB."
  cleanup_shadow
  exit 0
fi

echo ""
echo "Changes detected. Migration preview:"
echo "──────────────────────────────────────"
cat "$TMP_MIGRATION"
echo "──────────────────────────────────────"
echo ""

if [ -n "$SKIP_APPLY" ]; then
  echo "Saving migration to: ${MIGRATION_FILE}"
  mkdir -p "$MIGRATIONS_DIR"
  mv "$TMP_MIGRATION" "$MIGRATION_FILE"
  echo "Skipping apply (SKIP_APPLY is set). Apply manually with:"
  echo "  psql '${SUPABASE_DB_URL}' -f '${MIGRATION_FILE}'"
  cleanup_shadow
  exit 0
fi

# ──────────────────────────────────────────────────────────────
# 4. Save and apply migration to supabase DB
# ──────────────────────────────────────────────────────────────
echo "Saving migration to: ${MIGRATION_FILE}"
mkdir -p "$MIGRATIONS_DIR"
mv "$TMP_MIGRATION" "$MIGRATION_FILE"

echo "Applying migration to supabase DB..."
psql "$SUPABASE_DB_URL" -f "$MIGRATION_FILE"

# ──────────────────────────────────────────────────────────────
# 5. Verify roundtrip
# ──────────────────────────────────────────────────────────────
if [ -z "$SKIP_VERIFY" ]; then
  echo ""
  echo "=== Roundtrip verification ==="
  echo "Verifying: diff supabase DB vs shadow DB (expect 0 changes)..."

  VERIFY_OPTS=(
    --source "$SUPABASE_DB_URL"
    --target "$SHADOW_URL"
    --integration supabase
  )
  VERIFY_OUTPUT=$($PGDELTA plan "${VERIFY_OPTS[@]}" 2>&1) || true

  if echo "$VERIFY_OUTPUT" | grep -q "No changes detected."; then
    echo "Verification PASSED: 0 changes after migration."
  else
    echo "$VERIFY_OUTPUT"
    echo ""
    echo "Writing full diff for debugging..."
    $PGDELTA plan "${VERIFY_OPTS[@]}" --format sql || true
    echo ""
    echo "Verification FAILED: diff still reports changes after applying migration."
    cleanup_shadow
    exit 1
  fi
else
  echo "Skipping verification (SKIP_VERIFY is set)."
fi

# ──────────────────────────────────────────────────────────────
# 6. Cleanup
# ──────────────────────────────────────────────────────────────
cleanup_shadow
echo ""
echo "Done. Migration applied: ${MIGRATION_FILE}"
