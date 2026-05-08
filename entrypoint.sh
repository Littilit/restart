#!/bin/sh
set -e

echo "Running prisma db push..."
node node_modules/prisma/build/index.js db push --url "$DATABASE_URL" --schema ./prisma/schema.prisma || true

echo "Starting Next.js..."
exec node server.js
