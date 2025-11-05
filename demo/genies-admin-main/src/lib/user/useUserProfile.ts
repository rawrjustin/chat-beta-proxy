import { useState, useEffect } from 'react';
import { ProfileApi } from 'src/lib/swagger/user/';
import { generateAuthHeader, getApiConfig } from 'src/lib/swagger/user/util';
import { getTokens } from '../auth/tokens';
import type { GetMyUserProfileResponse } from 'src/lib/swagger/user/api';

export const useUserProfile = (isAuthenticated: boolean) => {
  const [profile, setProfile] = useState<GetMyUserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const { accessToken } = getTokens();
        if (!accessToken) throw new Error('No access token');
        const api = new ProfileApi(getApiConfig());
        const response = await api.getMyUserProfile(
          generateAuthHeader(accessToken),
        );
        setProfile(response);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated]);

  return { profile, loading, error };
};
