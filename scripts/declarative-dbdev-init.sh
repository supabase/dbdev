#!/bin/bash
set -e

# ──────────────────────────────────────────────────────────────
# declarative-dbdev-init.sh
#
# Initializes declarative schema files from the dbdev supabase project
# using pgschema (https://www.pgschema.com/).
#
# 1. Starts the dbdev supabase project (applies all migrations)
# 2. Generates prerequisite SQL files (extensions.sql, schemas-setup.sql)
# 3. Dumps each schema using pgschema dump --multi-file
# 4. Optionally verifies roundtrip: applies to a shadow DB, plans (expect 0 changes)
#
# Run from the dbdev repo root:
#   bash scripts/declarative-dbdev-init.sh
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
SKIP_SUPABASE_START="${SKIP_SUPABASE_START:-}"
SKIP_VERIFY="${SKIP_VERIFY:-}"

# Schemas to manage (order matters: app first, then public which references app)
SCHEMAS=("app" "public")

cleanup_shadow() {
  echo "Cleaning up shadow container..."
  docker rm -f "$SHADOW_CONTAINER" >/dev/null 2>&1 || true
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
# 1. Start the dbdev supabase project
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
# 2. Generate prerequisite SQL files
#    These are always recreated so the init script is self-contained.
# ──────────────────────────────────────────────────────────────
mkdir -p "$OUTPUT_DIR"

echo "Generating extensions.sql..."
cat > "${OUTPUT_DIR}/extensions.sql" <<'EXTENSIONS_EOF'
-- Extensions required by dbdev (pgschema does not manage extensions)
-- Apply this file with psql before running pgschema apply

create extension if not exists citext with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_trgm with schema extensions;
EXTENSIONS_EOF

echo "Generating schemas-setup.sql..."
cat > "${OUTPUT_DIR}/schemas-setup.sql" <<'SCHEMAS_EOF'
-- Schema creation and default privileges (pgschema manages objects within schemas, not schemas themselves)
-- Apply this file with psql before running pgschema apply

create schema if not exists app authorization postgres;

alter default privileges for role postgres in schema app grant select on tables to anon;
alter default privileges for role postgres in schema app grant select on tables to authenticated;

grant usage on schema app to anon;
grant usage on schema app to authenticated;
SCHEMAS_EOF

# ──────────────────────────────────────────────────────────────
# 3. Dump each schema with pgschema
# ──────────────────────────────────────────────────────────────
echo "Dumping declarative schemas..."
for schema in "${SCHEMAS[@]}"; do
  echo "  Dumping schema: ${schema}"
  rm -rf "${OUTPUT_DIR}/${schema}"
  $PGSCHEMA dump \
    --host localhost --port "$SUPABASE_DB_PORT" --db postgres --user supabase_admin \
    --password postgres \
    --schema "$schema" \
    --multi-file \
    --file "${OUTPUT_DIR}/${schema}/main.sql"
done

# ──────────────────────────────────────────────────────────────
# 4. Verify roundtrip: apply to fresh shadow DB, then plan
# ──────────────────────────────────────────────────────────────
if [ -z "$SKIP_VERIFY" ]; then
  echo ""
  echo "=== Roundtrip verification ==="

  start_shadow

  echo "Applying prerequisites to shadow DB..."
  psql "$SHADOW_URL" -f "${OUTPUT_DIR}/extensions.sql"
  psql "$SHADOW_URL" -f "${OUTPUT_DIR}/schemas-setup.sql"

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

  echo "Verifying roundtrip: plan each schema (expect 0 changes)..."
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
    echo "Verification FAILED: plan reported changes after roundtrip."
    cleanup_shadow
    exit 1
  else
    echo "Verification PASSED: 0 changes (declarative schema roundtrip OK)."
  fi

  cleanup_shadow
else
  echo "Skipping verification (SKIP_VERIFY is set)."
fi

echo ""
echo "Done. Declarative schema written to: ${OUTPUT_DIR}"
echo "Supabase project is still running (use 'cd ${DBDEV_DIR} && supabase stop' to stop)."
