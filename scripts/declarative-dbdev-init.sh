#!/bin/bash
set -e

# ──────────────────────────────────────────────────────────────
# declarative-dbdev-init.sh
#
# Initializes a declarative schema from the dbdev supabase project.
# 1. Starts a shadow DB (supabase/postgres image) for the baseline
# 2. Snapshots the clean baseline catalog
# 3. Starts the dbdev supabase project (applies all migrations)
# 4. Exports the declarative schema (diff: baseline → supabase DB)
# 5. Verifies roundtrip: apply to fresh shadow DB, then diff
#
# Run from the dbdev repo root so npx pgdelta resolves from node_modules:
#   bash scripts/declarative-dbdev-init.sh
# ──────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DBDEV_DIR="${DBDEV_DIR:-${SCRIPT_DIR}/..}"

SHADOW_IMAGE="${SHADOW_IMAGE:-supabase/postgres:15.8.1.085}"
SHADOW_CONTAINER="pgdelta-dbdev-shadow"
SHADOW_PORT="${SHADOW_PORT:-6544}"
SHADOW_URL="postgres://supabase_admin:postgres@localhost:${SHADOW_PORT}/postgres"

SUPABASE_DB_PORT=54322
SUPABASE_DB_URL="postgres://supabase_admin:postgres@localhost:${SUPABASE_DB_PORT}/postgres"

PGDELTA="${PGDELTA:-npx pgdelta}"
OUTPUT_DIR="${OUTPUT_DIR:-${DBDEV_DIR}/declarative-schemas}"
BASELINE_SNAPSHOT="${BASELINE_SNAPSHOT:-${DBDEV_DIR}/baseline-catalog.json}"
SKIP_SUPABASE_START="${SKIP_SUPABASE_START:-}"
SKIP_VERIFY="${SKIP_VERIFY:-}"

FORMAT_OPTIONS='{"keywordCase":"lower","maxWidth":180,"indent":4}'

cleanup_shadow() {
  echo "Cleaning up shadow container..."
  docker rm -f "$SHADOW_CONTAINER" >/dev/null 2>&1 || true
  rm -f "$BASELINE_SNAPSHOT"
}

start_shadow() {
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
}

# ──────────────────────────────────────────────────────────────
# 1. Start shadow DB and snapshot baseline
# ──────────────────────────────────────────────────────────────
start_shadow

echo "Snapshotting clean shadow DB as catalog baseline..."
$PGDELTA catalog-export --target "$SHADOW_URL" --output "$BASELINE_SNAPSHOT"

# ──────────────────────────────────────────────────────────────
# 2. Start the dbdev supabase project
# ──────────────────────────────────────────────────────────────
if [ -z "$SKIP_SUPABASE_START" ]; then
  echo "Starting dbdev supabase project..."
  (cd "$DBDEV_DIR" && supabase start)
else
  echo "Skipping supabase start (SKIP_SUPABASE_START is set)."
  echo "Checking supabase DB is reachable..."
  until pg_isready -h localhost -p "$SUPABASE_DB_PORT" -U postgres 2>/dev/null; do
    echo "  Waiting for supabase DB on port ${SUPABASE_DB_PORT}..."
    sleep 2
  done
fi

# ──────────────────────────────────────────────────────────────
# 3. Export declarative schema (baseline → supabase DB)
# ──────────────────────────────────────────────────────────────
EXPORT_OPTS=(
  --source "$BASELINE_SNAPSHOT"
  --target "$SUPABASE_DB_URL"
  --output "$OUTPUT_DIR"
  --integration supabase
  --force
  --format-options "$FORMAT_OPTIONS"
)

echo "Exporting declarative schema..."
$PGDELTA declarative export "${EXPORT_OPTS[@]}"

# ──────────────────────────────────────────────────────────────
# 4. Verify roundtrip: apply to fresh shadow DB, then diff
# ──────────────────────────────────────────────────────────────
if [ -z "$SKIP_VERIFY" ]; then
  echo ""
  echo "=== Roundtrip verification ==="

  echo "Resetting shadow DB for verification..."
  docker rm -f "$SHADOW_CONTAINER" >/dev/null 2>&1
  start_shadow

  echo "Applying declarative schema to shadow DB..."
  $PGDELTA declarative apply \
    --path "$OUTPUT_DIR" \
    --target "$SHADOW_URL"

  echo "Verifying roundtrip: diff shadow DB vs supabase DB (expect 0 changes)..."
  VERIFY_OPTS=(
    --source "$SHADOW_URL"
    --target "$SUPABASE_DB_URL"
    --integration supabase
  )
  VERIFY_OUTPUT=$($PGDELTA plan "${VERIFY_OPTS[@]}" 2>&1) || true

  if echo "$VERIFY_OUTPUT" | grep -q "No changes detected."; then
    echo "Verification PASSED: 0 changes (declarative schema roundtrip OK)."
  else
    echo "$VERIFY_OUTPUT"
    echo ""
    echo "Writing full diff for debugging..."
    $PGDELTA plan "${VERIFY_OPTS[@]}" --format sql || true
    echo ""
    echo "Verification FAILED: diff reported changes after roundtrip."
    cleanup_shadow
    exit 1
  fi
else
  echo "Skipping verification (SKIP_VERIFY is set)."
fi

# ──────────────────────────────────────────────────────────────
# 5. Cleanup
# ──────────────────────────────────────────────────────────────
cleanup_shadow
echo ""
echo "Done. Declarative schema written to: ${OUTPUT_DIR}"
echo "Supabase project is still running (use 'cd ${DBDEV_DIR} && supabase stop' to stop)."
