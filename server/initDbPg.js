import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
    try {
        // Check if users table exists
        const checkTable = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        `);

        if (!checkTable.rows[0].exists) {
            console.log('PostgreSQL tables not found. Initializing schema...');
            const schemaPath = path.join(__dirname, '../database/schema_pg.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');

            // Execute schema
            await db.query(schema);
            console.log('Database schema initialized successfully!');
        } else {
            console.log('Database tables already exist.');
        }
    } catch (err) {
        console.error('Database initialization failed:', err.message);
    }
}
