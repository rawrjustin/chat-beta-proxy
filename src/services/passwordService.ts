import crypto from 'crypto';
import { getDatabasePool, initializeDatabase } from './database';

/**
 * Character password configuration
 */
interface CharacterPassword {
  config_id: string;
  password_hash: string; // Hashed password using SHA-256
  hint: string | null;
  updated_at: string; // ISO timestamp
}

/**
 * Access token for password-protected characters
 */
interface AccessToken {
  config_id: string;
  token: string;
  expires_at: number; // Unix timestamp in milliseconds
}

/**
 * Service to manage character passwords and access tokens
 * Uses PostgreSQL database for password persistence (Railway)
 * Tokens remain in-memory (short-lived, don't need persistence)
 */
export class PasswordService {
  // In-memory storage for access tokens (short-lived, don't persist)
  // Key: token string, Value: AccessToken
  private tokens: Map<string, AccessToken> = new Map();
  
  // Default token TTL: 1 hour (3600 seconds)
  private readonly DEFAULT_TOKEN_TTL_SECONDS = 3600;
  
  // Track if database is available
  private databaseAvailable: boolean = false;
  
  constructor() {
    // Initialize database connection and schema
    this.initializeDatabaseConnection();
    
    // Clean up expired tokens every 5 minutes
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 5 * 60 * 1000);
  }
  
  /**
   * Initialize database connection
   */
  private async initializeDatabaseConnection(): Promise<void> {
    try {
      // Check if DATABASE_URL is available
      if (!process.env.DATABASE_URL) {
        console.warn('[PasswordService] DATABASE_URL not set - passwords will not persist across deployments');
        console.warn('[PasswordService] Add a PostgreSQL service in Railway to enable password persistence');
        this.databaseAvailable = false;
        return;
      }
      
      // Initialize database schema
      await initializeDatabase();
      this.databaseAvailable = true;
      console.log('[PasswordService] Database connection initialized');
    } catch (error) {
      console.error('[PasswordService] Failed to initialize database:', error);
      this.databaseAvailable = false;
    }
  }
  
  /**
   * Set or update password for a character
   */
  async setPassword(configId: string, password: string, hint?: string | null): Promise<void> {
    if (!password || password.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }

    // Hash the password using SHA-256
    const passwordHash = this.hashPassword(password);
    const updatedAt = new Date().toISOString();
    
    if (this.databaseAvailable) {
      // Save to database
      try {
        const db = getDatabasePool();
        await db.query(
          `INSERT INTO character_passwords (config_id, password_hash, hint, updated_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (config_id) 
           DO UPDATE SET password_hash = $2, hint = $3, updated_at = $4`,
          [configId, passwordHash, hint || null, updatedAt]
        );
        console.log(`[PasswordService] Password set for ${configId} (saved to database)`);
      } catch (error) {
        console.error('[PasswordService] Error saving password to database:', error);
        throw new Error('Failed to save password to database');
      }
    } else {
      throw new Error('Database not available. Please add a PostgreSQL service in Railway.');
    }
  }

  /**
   * Remove password for a character
   */
  async removePassword(configId: string): Promise<void> {
    if (this.databaseAvailable) {
      try {
        const db = getDatabasePool();
        await db.query('DELETE FROM character_passwords WHERE config_id = $1', [configId]);
        console.log(`[PasswordService] Password removed for ${configId}`);
      } catch (error) {
        console.error('[PasswordService] Error removing password from database:', error);
        throw new Error('Failed to remove password from database');
      }
    } else {
      throw new Error('Database not available. Please add a PostgreSQL service in Railway.');
    }
    
    // Also invalidate all tokens for this character
    this.invalidateTokensForCharacter(configId);
  }

  /**
   * Check if a character has a password
   */
  async hasPassword(configId: string): Promise<boolean> {
    if (!this.databaseAvailable) {
      return false;
    }
    
    try {
      const db = getDatabasePool();
      const result = await db.query(
        'SELECT 1 FROM character_passwords WHERE config_id = $1 LIMIT 1',
        [configId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('[PasswordService] Error checking password:', error);
      return false;
    }
  }

  /**
   * Get password hint for a character
   */
  async getHint(configId: string): Promise<string | null> {
    if (!this.databaseAvailable) {
      return null;
    }
    
    try {
      const db = getDatabasePool();
      const result = await db.query(
        'SELECT hint FROM character_passwords WHERE config_id = $1',
        [configId]
      );
      return result.rows.length > 0 ? result.rows[0].hint : null;
    } catch (error) {
      console.error('[PasswordService] Error getting hint:', error);
      return null;
    }
  }

  /**
   * Get password metadata (for admin display)
   */
  async getPasswordMetadata(configId: string): Promise<{
    password_required: boolean;
    password_hint: string | null;
    password_updated_at: string | null;
  }> {
    if (!this.databaseAvailable) {
      return {
        password_required: false,
        password_hint: null,
        password_updated_at: null,
      };
    }
    
    try {
      const db = getDatabasePool();
      const result = await db.query(
        'SELECT hint, updated_at FROM character_passwords WHERE config_id = $1',
        [configId]
      );
      
      if (result.rows.length === 0) {
        return {
          password_required: false,
          password_hint: null,
          password_updated_at: null,
        };
      }
      
      const row = result.rows[0];
      return {
        password_required: true,
        password_hint: row.hint,
        password_updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
      };
    } catch (error) {
      console.error('[PasswordService] Error getting password metadata:', error);
      return {
        password_required: false,
        password_hint: null,
        password_updated_at: null,
      };
    }
  }

  /**
   * Verify password for a character
   */
  async verifyPassword(configId: string, password: string): Promise<boolean> {
    if (!this.databaseAvailable) {
      return false;
    }
    
    try {
      const db = getDatabasePool();
      const result = await db.query(
        'SELECT password_hash FROM character_passwords WHERE config_id = $1',
        [configId]
      );
      
      if (result.rows.length === 0) {
        return false; // No password set
      }
      
      const storedHash = result.rows[0].password_hash;
      const passwordHash = this.hashPassword(password);
      return passwordHash === storedHash;
    } catch (error) {
      console.error('[PasswordService] Error verifying password:', error);
      return false;
    }
  }

  /**
   * Generate and store an access token for a character
   * Returns the token and expiration info
   */
  generateAccessToken(configId: string, ttlSeconds?: number): {
    token: string;
    expires_at: string; // ISO timestamp
    ttl_seconds: number;
  } {
    const ttl = ttlSeconds || this.DEFAULT_TOKEN_TTL_SECONDS;
    const expiresAt = Date.now() + (ttl * 1000);
    
    // Generate a random token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString('hex');
    
    const accessToken: AccessToken = {
      config_id: configId,
      token,
      expires_at: expiresAt,
    };
    
    this.tokens.set(token, accessToken);
    
    return {
      token,
      expires_at: new Date(expiresAt).toISOString(),
      ttl_seconds: ttl,
    };
  }

  /**
   * Validate an access token
   * Returns true if token is valid and not expired
   */
  validateToken(token: string, configId: string): boolean {
    const accessToken = this.tokens.get(token);
    
    if (!accessToken) {
      console.log(`[validateToken] Token not found in memory. Token: ${token.substring(0, 8)}..., Config: ${configId}, Total tokens: ${this.tokens.size}`);
      return false; // Token doesn't exist (likely server was restarted)
    }
    
    if (accessToken.config_id !== configId) {
      console.log(`[validateToken] Token config mismatch. Token config: ${accessToken.config_id}, Request config: ${configId}`);
      return false; // Token is for a different character
    }
    
    if (Date.now() > accessToken.expires_at) {
      // Token expired, remove it
      const expiredAt = new Date(accessToken.expires_at).toISOString();
      console.log(`[validateToken] Token expired. Expired at: ${expiredAt}, Current time: ${new Date().toISOString()}`);
      this.tokens.delete(token);
      return false;
    }
    
    console.log(`[validateToken] Token valid for ${configId}. Expires at: ${new Date(accessToken.expires_at).toISOString()}`);
    return true;
  }

  /**
   * Hash a password using SHA-256
   * Note: In production, use bcrypt or argon2 for better security
   */
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Invalidate all tokens for a specific character
   */
  private invalidateTokensForCharacter(configId: string): void {
    for (const [token, accessToken] of this.tokens.entries()) {
      if (accessToken.config_id === configId) {
        this.tokens.delete(token);
      }
    }
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, accessToken] of this.tokens.entries()) {
      if (now > accessToken.expires_at) {
        this.tokens.delete(token);
      }
    }
  }

  /**
   * Get all characters with passwords (for admin)
   */
  async getAllPasswordConfigs(): Promise<Array<{
    config_id: string;
    password_required: boolean;
    password_hint: string | null;
    password_updated_at: string | null;
  }>> {
    if (!this.databaseAvailable) {
      return [];
    }
    
    try {
      const db = getDatabasePool();
      const result = await db.query(
        'SELECT config_id, hint, updated_at FROM character_passwords ORDER BY updated_at DESC'
      );
      
      return result.rows.map(row => ({
        config_id: row.config_id,
        password_required: true,
        password_hint: row.hint,
        password_updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
      }));
    } catch (error) {
      console.error('[PasswordService] Error getting all password configs:', error);
      return [];
    }
  }
}

// Singleton instance
let passwordServiceInstance: PasswordService | null = null;

export function getPasswordService(): PasswordService {
  if (!passwordServiceInstance) {
    passwordServiceInstance = new PasswordService();
  }
  return passwordServiceInstance;
}
