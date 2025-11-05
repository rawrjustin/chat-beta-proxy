import { AuthV2NonAuthenticatedApi } from 'src/lib/swagger/user/';
import { getApiConfig } from 'src/lib/swagger/user/util';
import { storeTokens, getTokens } from './tokens';

export const useRefreshAccessToken = () => {
  const refreshAccessToken = async () => {
    const { refreshToken } = getTokens();
    if (!refreshToken) throw new Error('No refresh token found');

    try {
      const api = new AuthV2NonAuthenticatedApi(getApiConfig());
      const response = await api.refreshSession({ refreshToken });

      if (response.accessToken) {
        storeTokens({
          accessToken: response.accessToken,
          refreshToken: refreshToken,
        });
      }
    } catch (error: any) {
      if (error instanceof Response) {
        try {
          const errorData = await error.json();
          throw new Error(errorData.error || `Server error (${error.status})`);
        } catch (jsonError) {
          throw new Error(`Server error (${error.status})`);
        }
      }
      throw new Error('Failed to refresh access token');
    }
  };

  return { refreshAccessToken };
};
