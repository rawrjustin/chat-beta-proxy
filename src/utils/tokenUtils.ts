import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: any;
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded.exp) return true;

    // Add 5 minute buffer - refresh if token expires within 5 minutes
    const expiryWithBuffer = (decoded.exp * 1000) - (5 * 60 * 1000);
    return Date.now() >= expiryWithBuffer;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
}

/**
 * Get time until token expires (in milliseconds)
 */
export function getTokenExpiryTime(token: string | null): number | null {
  if (!token) return null;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded.exp) return null;

    const expiryTime = decoded.exp * 1000;
    const timeUntilExpiry = expiryTime - Date.now();

    return timeUntilExpiry > 0 ? timeUntilExpiry : 0;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Extract user information from token
 */
export function getUserFromToken(token: string | null): { userId: string } | null {
  if (!token) return null;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return {
      userId: decoded.sub || 'unknown',
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
