import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Load .env.local (same as the backend's dotenv setup)
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
