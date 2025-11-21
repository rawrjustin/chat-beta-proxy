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
    
    // Create characters table for dynamic character management
    await db.query(`
      CREATE TABLE IF NOT EXISTS characters (
        config_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        display_order INTEGER,
        avatar_url TEXT,
        hidden BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create index on config_id for faster lookups
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_characters_config_id 
      ON characters(config_id)
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

/**
 * Character database operations
 */
export interface CharacterRecord {
  config_id: string;
  name?: string;
  description?: string;
  display_order?: number;
  avatar_url?: string;
  hidden?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Get all characters from database
 */
export async function getCharactersFromDatabase(): Promise<CharacterRecord[]> {
  try {
    const db = getDatabasePool();
    const result = await db.query<CharacterRecord>(`
      SELECT 
        config_id,
        name,
        description,
        display_order,
        avatar_url,
        hidden,
        created_at,
        updated_at
      FROM characters
      ORDER BY display_order ASC NULLS LAST, created_at ASC
    `);
    return result.rows;
  } catch (error) {
    console.error('[Database] Error fetching characters:', error);
    // Return empty array if database is not available
    return [];
  }
}

/**
 * Get a single character from database by config_id
 */
export async function getCharacterFromDatabase(configId: string): Promise<CharacterRecord | null> {
  try {
    const db = getDatabasePool();
    const result = await db.query<CharacterRecord>(`
      SELECT 
        config_id,
        name,
        description,
        display_order,
        avatar_url,
        hidden,
        created_at,
        updated_at
      FROM characters
      WHERE config_id = $1
    `, [configId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('[Database] Error fetching character:', error);
    return null;
  }
}

/**
 * Insert or update a character in the database
 */
export async function upsertCharacter(character: CharacterRecord): Promise<CharacterRecord> {
  const db = getDatabasePool();
  const result = await db.query<CharacterRecord>(`
    INSERT INTO characters (
      config_id,
      name,
      description,
      display_order,
      avatar_url,
      hidden,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (config_id) 
    DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      display_order = EXCLUDED.display_order,
      avatar_url = EXCLUDED.avatar_url,
      hidden = EXCLUDED.hidden,
      updated_at = NOW()
    RETURNING *
  `, [
    character.config_id,
    character.name || null,
    character.description || null,
    character.display_order || null,
    character.avatar_url || null,
    character.hidden || false,
  ]);
  return result.rows[0];
}

/**
 * Delete a character from the database
 */
export async function deleteCharacterFromDatabase(configId: string): Promise<boolean> {
  try {
    const db = getDatabasePool();
    const result = await db.query(`
      DELETE FROM characters
      WHERE config_id = $1
    `, [configId]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('[Database] Error deleting character:', error);
    return false;
  }
}

