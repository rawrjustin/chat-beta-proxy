import { useEffect, useState } from 'react';
import { getTokens } from 'src/lib/auth';
import { Configuration } from 'src/lib/swagger/user/';

export const getApiConfig = () => {
  return new Configuration({
    basePath: process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL,
  });
};

export const useAccessToken = () => {
  const [accessToken, setAccessToken] = useState(null);
  useEffect(() => {
    const getAuthHeaders = () => {
      const { accessToken } = getTokens();
      setAccessToken(accessToken);
    };
    getAuthHeaders();
  }, []);
  return accessToken;
};

export const generateAuthHeader = (accessToken: string) => {
  return accessToken
    ? {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    : null;
};
