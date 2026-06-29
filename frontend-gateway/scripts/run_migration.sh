#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Starting streak database migration..."
deno run --allow-env --allow-net --allow-read --allow-write scripts/db_migrate_streaks.ts

echo "Migration completed successfully!"
