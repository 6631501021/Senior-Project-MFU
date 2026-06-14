'use strict';

const path = require('path');

// Load .env.local to pick up DATABASE_URL (same as the backend's config.js)
var envPath = process.env.DOTENV_CONFIG_PATH || '.env.local';
require('dotenv').config({ path: path.resolve(__dirname, '..', envPath) });

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// Singleton pattern — ensures only one PrismaClient instance is created
// across the entire Node.js backend, preventing connection pool exhaustion.
let prisma;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter });
} else {
  // In development, reuse the same instance across hot-reloads
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      adapter,
      log: ['query', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
