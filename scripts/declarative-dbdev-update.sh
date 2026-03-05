#!/bin/bash
set -e

# ──────────────────────────────────────────────────────────────
# declarative-dbdev-update.sh
#
# After editing declarative schema files, this script:
# 1. Starts a shadow DB (supabase/postgres image)
# 2. Applies prerequisites (extensions, schema creation) to shadow
# 3. Applies declarative schemas to shadow via pgschema (desired state)
# 4. Plans per-schema diffs (supabase DB vs desired state) to generate migration SQL
# 5. Applies the migration to the supabase project DB
# 6. Verifies the roundtrip (expect 0 remaining changes)
#
# Run from the dbdev repo root:
#   MIGRATION_NAME=my_change bash scripts/declarative-dbdev-update.sh
# ──────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DBDEV_DIR="${DBDEV_DIR:-${SCRIPT_DIR}/..}"

SHADOW_IMAGE="${SHADOW_IMAGE:-supabase/postgres:15.8.1.085}"
SHADOW_CONTAINER="pgschema-dbdev-shadow"
SHADOW_PORT="${SHADOW_PORT:-6544}"
SHADOW_URL="postgres://supabase_admin:postgres@localhost:${SHADOW_PORT}/postgres"

SUPABASE_DB_PORT=54322
SUPABASE_DB_URL="postgres://supabase_admin:postgres@localhost:${SUPABASE_DB_PORT}/postgres"

PGSCHEMA="${PGSCHEMA:-pgschema}"
OUTPUT_DIR="${OUTPUT_DIR:-${DBDEV_DIR}/declarative-schemas}"
MIGRATION_NAME="${MIGRATION_NAME:-declarative_update}"
SKIP_APPLY="${SKIP_APPLY:-}"
SKIP_VERIFY="${SKIP_VERIFY:-}"

MIGRATIONS_DIR="${DBDEV_DIR}/supabase/migrations"

# Schemas to manage (order matters: app first, then public which references app)
SCHEMAS=("app" "public")

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
# 2. Apply prerequisites to shadow DB
# ──────────────────────────────────────────────────────────────
echo "Applying prerequisites to shadow DB..."
psql "$SHADOW_URL" -f "${OUTPUT_DIR}/extensions.sql"
psql "$SHADOW_URL" -f "${OUTPUT_DIR}/schemas-setup.sql"

# ──────────────────────────────────────────────────────────────
# 3. Apply declarative schemas to shadow DB (desired state)
# ──────────────────────────────────────────────────────────────
echo "Applying declarative schemas to shadow DB..."
for schema in "${SCHEMAS[@]}"; do
  echo "  Applying schema: ${schema}"
  $PGSCHEMA apply \
    --host localhost --port "$SHADOW_PORT" --db postgres --user supabase_admin \
    --password postgres \
    --schema "$schema" \
    --file "${OUTPUT_DIR}/${schema}/main.sql" \
    --auto-approve \
    --plan-host localhost --plan-port "$SHADOW_PORT" --plan-db postgres \
    --plan-user supabase_admin --plan-password postgres
done

# ──────────────────────────────────────────────────────────────
# 4. Generate migration: plan per-schema, concatenate SQL
# ──────────────────────────────────────────────────────────────
TIMESTAMP=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="${MIGRATIONS_DIR}/${TIMESTAMP}_${MIGRATION_NAME}.sql"
TMP_DIR="/tmp/pgschema-dbdev-migration-${TIMESTAMP}"
mkdir -p "$TMP_DIR"

echo "Generating migration (plan per-schema against supabase DB)..."
HAS_CHANGES=0

for schema in "${SCHEMAS[@]}"; do
  echo "  Planning schema: ${schema}"
  TMP_FILE="${TMP_DIR}/migration-${schema}.sql"
  PLAN_EXIT=0
  $PGSCHEMA plan \
    --host localhost --port "$SUPABASE_DB_PORT" --db postgres --user supabase_admin \
    --password postgres \
    --schema "$schema" \
    --file "${OUTPUT_DIR}/${schema}/main.sql" \
    --plan-host localhost --plan-port "$SHADOW_PORT" --plan-db postgres \
    --plan-user supabase_admin --plan-password postgres \
    --output-sql "$TMP_FILE" 2>&1 || PLAN_EXIT=$?

  if [ -s "$TMP_FILE" ]; then
    HAS_CHANGES=1
    echo "    ${schema}: changes detected"
  else
    echo "    ${schema}: no changes"
    rm -f "$TMP_FILE"
  fi
done

if [ "$HAS_CHANGES" -eq 0 ]; then
  echo ""
  echo "No changes detected. Declarative schema matches the supabase DB."
  cleanup_shadow
  rm -rf "$TMP_DIR"
  exit 0
fi

# Concatenate per-schema migrations into one file
echo "-- Generated by declarative-dbdev-update.sh at $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "${TMP_DIR}/combined.sql"
for schema in "${SCHEMAS[@]}"; do
  TMP_FILE="${TMP_DIR}/migration-${schema}.sql"
  if [ -f "$TMP_FILE" ]; then
    echo "" >> "${TMP_DIR}/combined.sql"
    echo "-- Schema: ${schema}" >> "${TMP_DIR}/combined.sql"
    cat "$TMP_FILE" >> "${TMP_DIR}/combined.sql"
  fi
done

echo ""
echo "Changes detected. Migration preview:"
echo "──────────────────────────────────────"
cat "${TMP_DIR}/combined.sql"
echo "──────────────────────────────────────"
echo ""

if [ -n "$SKIP_APPLY" ]; then
  echo "Saving migration to: ${MIGRATION_FILE}"
  mkdir -p "$MIGRATIONS_DIR"
  mv "${TMP_DIR}/combined.sql" "$MIGRATION_FILE"
  echo "Skipping apply (SKIP_APPLY is set). Apply manually with:"
  echo "  psql '${SUPABASE_DB_URL}' -f '${MIGRATION_FILE}'"
  cleanup_shadow
  rm -rf "$TMP_DIR"
  exit 0
fi

# ──────────────────────────────────────────────────────────────
# 5. Save and apply migration to supabase DB
# ──────────────────────────────────────────────────────────────
echo "Saving migration to: ${MIGRATION_FILE}"
mkdir -p "$MIGRATIONS_DIR"
mv "${TMP_DIR}/combined.sql" "$MIGRATION_FILE"

echo "Applying migration to supabase DB..."
psql "$SUPABASE_DB_URL" -f "$MIGRATION_FILE"

# ──────────────────────────────────────────────────────────────
# 6. Verify roundtrip
# ──────────────────────────────────────────────────────────────
if [ -z "$SKIP_VERIFY" ]; then
  echo ""
  echo "=== Roundtrip verification ==="
  echo "Verifying: plan each schema (expect 0 changes)..."

  VERIFY_FAILED=0
  for schema in "${SCHEMAS[@]}"; do
    echo "  Verifying schema: ${schema}"
    PLAN_OUTPUT=$($PGSCHEMA plan \
      --host localhost --port "$SUPABASE_DB_PORT" --db postgres --user supabase_admin \
      --password postgres \
      --schema "$schema" \
      --file "${OUTPUT_DIR}/${schema}/main.sql" \
      --plan-host localhost --plan-port "$SHADOW_PORT" --plan-db postgres \
      --plan-user supabase_admin --plan-password postgres \
      --output-human stdout 2>&1) || true

    if echo "$PLAN_OUTPUT" | grep -qi "no changes\|0 changes\|nothing to do\|up to date"; then
      echo "    ${schema}: OK (0 changes)"
    else
      echo "    ${schema}: changes detected!"
      echo "$PLAN_OUTPUT"
      VERIFY_FAILED=1
    fi
  done

  if [ "$VERIFY_FAILED" -eq 1 ]; then
    echo ""
    echo "Verification FAILED: plan still reports changes after applying migration."
    cleanup_shadow
    rm -rf "$TMP_DIR"
    exit 1
  else
    echo "Verification PASSED: 0 changes after migration."
  fi
else
  echo "Skipping verification (SKIP_VERIFY is set)."
fi

# ──────────────────────────────────────────────────────────────
# 7. Cleanup
# ──────────────────────────────────────────────────────────────
cleanup_shadow
rm -rf "$TMP_DIR"
echo ""
echo "Done. Migration applied: ${MIGRATION_FILE}"
