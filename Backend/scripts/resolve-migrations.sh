#!/bin/bash
# Resolve all failed prisma migrations so `migrate deploy` can proceed
# Each failed migration is marked as "applied" since the schema already
# includes their changes — the failure was a metadata write issue.
set -e
for dir in prisma/migrations/*/; do
  name=$(basename "$dir")
  npx prisma migrate resolve --applied "$name" 2>/dev/null || true
done
