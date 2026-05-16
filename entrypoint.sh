#!/bin/sh
set -e

echo "Pre-migration: 'experte' -> 'folge' falls noch vorhanden..."
node << 'MIGRATE' || true
const { PrismaClient } = require('@prisma/client');
async function run() {
  const p = new PrismaClient();
  try {
    const n = await p.$executeRawUnsafe(
      "UPDATE \"Empfehlung\" SET typ = 'folge' WHERE typ::text = 'experte'"
    );
    if (n > 0) console.log('Migrated', n, 'experte -> folge');
  } catch (e) {
    console.log('Pre-migration note:', e.message);
  } finally {
    await p.$disconnect();
  }
}
run();
MIGRATE

echo "Running prisma db push..."
node node_modules/prisma/build/index.js db push --accept-data-loss

echo "Starting Next.js..."
exec node server.js
