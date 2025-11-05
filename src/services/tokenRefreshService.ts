import fetch from 'node-fetch';
import { isTokenExpired, getTokenExpiryTime } from '../utils/tokenUtils';

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class TokenRefreshService {
  private accessToken: string;
  private refreshToken: string;
  private refreshUrl: string;
  private refreshInterval: NodeJS.Timeout | null = null;
  private onTokenRefreshed?: (accessToken: string, refreshToken: string) => void;

  constructor(
    accessToken: string,
    refreshToken: string,
    refreshUrl: string,
    onTokenRefreshed?: (accessToken: string, refreshToken: string) => void
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.refreshUrl = refreshUrl;
    this.onTokenRefreshed = onTokenRefreshed;
  }

  /**
   * Get current access token, refresh if needed
   */
  async getValidAccessToken(): Promise<string> {
    if (!isTokenExpired(this.accessToken)) {
      return this.accessToken;
    }

    console.log('Access token expired, refreshing...');
    await this.refreshAccessToken();
    return this.accessToken;
  }

  /**
   * Manually refresh the access token using refresh token
   */
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('Calling token refresh endpoint...');
      const response = await fetch(this.refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
      }

      const data = (await response.json()) as RefreshTokenResponse;

      if (!data.accessToken) {
        throw new Error('No access token in refresh response');
      }

      const oldToken = this.accessToken;
      this.accessToken = data.accessToken;

      // Update refresh token if a new one was provided
      if (data.refreshToken) {
        this.refreshToken = data.refreshToken;
      }

      console.log('✅ Token refreshed successfully');

      // Notify callback if provided
      if (this.onTokenRefreshed) {
        this.onTokenRefreshed(this.accessToken, this.refreshToken);
      }

      // Log token expiry info
      const expiryTime = getTokenExpiryTime(this.accessToken);
      if (expiryTime) {
        const expiryDate = new Date(Date.now() + expiryTime);
        console.log(`New token expires at: ${expiryDate.toISOString()}`);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Start periodic token refresh
   * @param intervalMinutes - Interval in minutes (default: 30)
   */
  startPeriodicRefresh(intervalMinutes: number = 30): void {
    if (this.refreshInterval) {
      console.log('Periodic refresh already running');
      return;
    }

    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(`Starting periodic token refresh every ${intervalMinutes} minutes`);

    this.refreshInterval = setInterval(async () => {
      try {
        console.log(`[Periodic Refresh] Checking token expiry...`);

        if (isTokenExpired(this.accessToken)) {
          console.log('[Periodic Refresh] Token expired or expiring soon, refreshing...');
          await this.refreshAccessToken();
        } else {
          const expiryTime = getTokenExpiryTime(this.accessToken);
          if (expiryTime) {
            const minutesLeft = Math.floor(expiryTime / (60 * 1000));
            console.log(`[Periodic Refresh] Token still valid. Expires in ${minutesLeft} minutes`);
          }
        }
      } catch (error) {
        console.error('[Periodic Refresh] Failed to refresh token:', error);
      }
    }, intervalMs);

    // Also do an immediate check
    this.getValidAccessToken().catch((error) => {
      console.error('Initial token validation failed:', error);
    });
  }

  /**
   * Stop periodic token refresh
   */
  stopPeriodicRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('Periodic token refresh stopped');
    }
  }

  /**
   * Get current tokens
   */
  getTokens(): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  }

  /**
   * Update tokens manually
   */
  updateTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
