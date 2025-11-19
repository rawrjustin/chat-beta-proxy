import crypto from 'crypto';

/**
 * Character password configuration
 */
interface CharacterPassword {
  config_id: string;
  password_hash: string; // Hashed password using bcrypt or similar
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
 * Uses in-memory storage (can be replaced with database in production)
 */
export class PasswordService {
  // In-memory storage for character passwords
  private passwords: Map<string, CharacterPassword> = new Map();
  
  // In-memory storage for access tokens
  // Key: token string, Value: AccessToken
  private tokens: Map<string, AccessToken> = new Map();
  
  // Default token TTL: 1 hour (3600 seconds)
  private readonly DEFAULT_TOKEN_TTL_SECONDS = 3600;
  
  constructor() {
    // Clean up expired tokens every 5 minutes
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 5 * 60 * 1000);
  }

  /**
   * Set or update password for a character
   */
  setPassword(configId: string, password: string, hint?: string | null): void {
    if (!password || password.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }

    // Hash the password using SHA-256 (simple approach)
    // In production, consider using bcrypt or argon2
    const passwordHash = this.hashPassword(password);
    
    const passwordConfig: CharacterPassword = {
      config_id: configId,
      password_hash: passwordHash,
      hint: hint || null,
      updated_at: new Date().toISOString(),
    };
    
    this.passwords.set(configId, passwordConfig);
  }

  /**
   * Remove password for a character
   */
  removePassword(configId: string): void {
    this.passwords.delete(configId);
    // Also invalidate all tokens for this character
    this.invalidateTokensForCharacter(configId);
  }

  /**
   * Check if a character has a password
   */
  hasPassword(configId: string): boolean {
    return this.passwords.has(configId);
  }

  /**
   * Get password hint for a character
   */
  getHint(configId: string): string | null {
    const passwordConfig = this.passwords.get(configId);
    return passwordConfig?.hint || null;
  }

  /**
   * Get password metadata (for admin display)
   */
  getPasswordMetadata(configId: string): {
    password_required: boolean;
    password_hint: string | null;
    password_updated_at: string | null;
  } {
    const passwordConfig = this.passwords.get(configId);
    
    if (!passwordConfig) {
      return {
        password_required: false,
        password_hint: null,
        password_updated_at: null,
      };
    }
    
    return {
      password_required: true,
      password_hint: passwordConfig.hint,
      password_updated_at: passwordConfig.updated_at,
    };
  }

  /**
   * Verify password for a character
   */
  verifyPassword(configId: string, password: string): boolean {
    const passwordConfig = this.passwords.get(configId);
    
    if (!passwordConfig) {
      return false; // No password set, so verification fails
    }
    
    const passwordHash = this.hashPassword(password);
    return passwordHash === passwordConfig.password_hash;
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
      return false; // Token doesn't exist
    }
    
    if (accessToken.config_id !== configId) {
      return false; // Token is for a different character
    }
    
    if (Date.now() > accessToken.expires_at) {
      // Token expired, remove it
      this.tokens.delete(token);
      return false;
    }
    
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
  getAllPasswordConfigs(): Array<{
    config_id: string;
    password_required: boolean;
    password_hint: string | null;
    password_updated_at: string | null;
  }> {
    const result: Array<{
      config_id: string;
      password_required: boolean;
      password_hint: string | null;
      password_updated_at: string | null;
    }> = [];
    
    for (const [configId, passwordConfig] of this.passwords.entries()) {
      result.push({
        config_id: configId,
        password_required: true,
        password_hint: passwordConfig.hint,
        password_updated_at: passwordConfig.updated_at,
      });
    }
    
    return result;
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

