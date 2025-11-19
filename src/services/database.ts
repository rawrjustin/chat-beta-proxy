import { Pool, PoolClient } from 'pg';

/**
 * Database connection pool
 * Uses DATABASE_URL from environment (Railway provides this automatically)
 */
let pool: Pool | null = null;

/**
 * Get or create database connection pool
 */
export function getDatabasePool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL environment variable is required.\n' +
        'Railway provides this automatically when you add a PostgreSQL service.\n' +
        'To set it up:\n' +
        '1. Go to Railway dashboard → Your project\n' +
        '2. Click on the PostgreSQL service\n' +
        '3. Go to "Variables" tab\n' +
        '4. Copy the DATABASE_URL value\n' +
        '5. Go to your chat-beta-proxy service → Variables tab\n' +
        '6. Add DATABASE_URL with the copied value\n' +
        'Or connect the services in Railway dashboard (they should share variables automatically)'
      );
    }
    
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('railway') || databaseUrl.includes('postgres') ? { rejectUnauthorized: false } : undefined,
    });
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
    
    console.log('[Database] Connection pool created');
  }
  
  return pool;
}

/**
 * Initialize database schema (creates tables if they don't exist)
 */
export async function initializeDatabase(): Promise<void> {
  const db = getDatabasePool();
  
  try {
    // Create character_passwords table
    await db.query(`
      CREATE TABLE IF NOT EXISTS character_passwords (
        config_id VARCHAR(255) PRIMARY KEY,
        password_hash VARCHAR(255) NOT NULL,
        hint TEXT,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create index on config_id for faster lookups
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_character_passwords_config_id 
      ON character_passwords(config_id)
    `);
    
    console.log('[Database] Schema initialized successfully');
  } catch (error) {
    console.error('[Database] Error initializing schema:', error);
    throw error;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const db = getDatabasePool();
    await db.query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('[Database] Connection test failed:', error);
    return false;
  }
}

