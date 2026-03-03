import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Use DATABASE_URL for Production (ElephantSQL, Render, etc.)
// Use individual variables for Local
const pool = process.env.DATABASE_URL
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })
  : new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'campus_events',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
  });

// Compatibility wrapper for mysql2-style queries
export default {
  query: (text, params) => pool.query(text, params),
  execute: (text, params) => pool.query(text.replace(/\?/g, (match, index) => `$${index + 1}`), params),
  pool: pool
};
