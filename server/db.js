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
  query: async (text, params) => {
    let queryText = text.replace(/\?/g, (match, index) => `$${index + 1}`);

    // Handle PostgreSQL returning for INSERTs
    const isInsert = queryText.trim().toUpperCase().startsWith('INSERT');
    if (isInsert && process.env.DATABASE_URL && !queryText.toUpperCase().includes('RETURNING')) {
      queryText += ' RETURNING id';
    }

    const result = await pool.query(queryText, params);

    // Add insertId compatibility for PostgreSQL
    if (isInsert && result.rows.length > 0) {
      result.insertId = result.rows[0].id;
    }

    // mysql2 returns [rows, fields], we mimic [rows, result]
    return [result.rows, result];
  },
  execute: async (text, params) => {
    let queryText = text.replace(/\?/g, (match, index) => `$${index + 1}`);

    // Handle PostgreSQL returning for INSERTs
    const isInsert = queryText.trim().toUpperCase().startsWith('INSERT');
    if (isInsert && process.env.DATABASE_URL && !queryText.toUpperCase().includes('RETURNING')) {
      queryText += ' RETURNING id';
    }

    const result = await pool.query(queryText, params);

    if (isInsert && result.rows.length > 0) {
      result.insertId = result.rows[0].id;
    }

    return [result.rows, result];
  },
  pool: pool
};
