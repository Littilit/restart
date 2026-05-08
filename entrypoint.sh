#!/bin/sh
set -e

echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo yes || echo NO)"
echo "Running prisma db push..."
node node_modules/prisma/build/index.js db push --url "$DATABASE_URL" --schema ./prisma/schema.prisma || echo "PRISMA DB PUSH FAILED (continuing)"

echo "Starting Next.js..."
exec node server.js
