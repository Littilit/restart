#!/bin/sh
set -e

echo "Running prisma db push..."
npx prisma db push --url "$DATABASE_URL" --schema ./prisma/schema.prisma

echo "Starting Next.js..."
exec node server.js
