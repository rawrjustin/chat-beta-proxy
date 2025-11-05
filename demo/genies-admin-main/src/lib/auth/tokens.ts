import Cookies from 'js-cookie';
import * as cookie from 'cookie';
import { jwtDecode } from 'jwt-decode';
import { getApiConfig } from '../swagger/user/util';
import { AuthV2NonAuthenticatedApi } from '../swagger/user/';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const storeTokens = ({
  accessToken,
  refreshToken,
}: AuthTokens): void => {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { path: '/', sameSite: 'lax' });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    path: '/',
    sameSite: 'lax',
    expires: 30,
  });
};

export const clearTokens = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
};

export const getTokens = (): Partial<AuthTokens> => ({
  accessToken: Cookies.get(ACCESS_TOKEN_KEY),
  refreshToken: Cookies.get(REFRESH_TOKEN_KEY),
});

export const getUserFromAccessToken = (
  accessToken: string,
): { userId: string } | null => {
  try {
    const decoded = jwtDecode(accessToken);

    return {
      userId: decoded.sub,
    };
  } catch (e) {
    return null;
  }
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

// helper to get valid access token from request on server
export const getValidAccessToken = async (req?: any, res?: any) => {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  if (typeof window === 'undefined') {
    // Server-side
    const cookies = cookie.parse(req?.headers?.cookie || '');
    accessToken = cookies[ACCESS_TOKEN_KEY] || null;
    refreshToken = cookies[REFRESH_TOKEN_KEY] || null;
  } else {
    // Client-side
    accessToken = Cookies.get(ACCESS_TOKEN_KEY) || null;
    refreshToken = Cookies.get(REFRESH_TOKEN_KEY) || null;
  }

  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }

  if (refreshToken) {
    try {
      const api = new AuthV2NonAuthenticatedApi(getApiConfig());
      const resp = await api.refreshSession({ refreshToken });
      if (resp?.accessToken && resp?.refreshToken) {
        if (typeof window === 'undefined' && res) {
          // Server: set cookies in response
          res.setHeader('Set-Cookie', [
            cookie.serialize(ACCESS_TOKEN_KEY, resp.accessToken, {
              path: '/',
              httpOnly: false,
              sameSite: 'lax',
            }),
            cookie.serialize(REFRESH_TOKEN_KEY, resp.refreshToken, {
              path: '/',
              httpOnly: false,
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 30, // 30 days
            }),
          ]);
        } else {
          // Client: set cookies with js-cookie
          storeTokens({
            accessToken: resp.accessToken,
            refreshToken: resp.refreshToken,
          });
        }
        return resp.accessToken;
      }
    } catch (error) {
      if (typeof window === 'undefined' && res) {
        res.setHeader('Set-Cookie', [
          cookie.serialize(ACCESS_TOKEN_KEY, '', { path: '/', maxAge: 0 }),
          cookie.serialize(REFRESH_TOKEN_KEY, '', { path: '/', maxAge: 0 }),
        ]);
      } else {
        clearTokens();
      }

      console.error('Error refreshing token:', error);
    }
  }

  return null;
};
