#!/bin/sh
set -e

echo "Running prisma db push..."
node node_modules/prisma/build/index.js db push

echo "Starting Next.js..."
exec node server.js
