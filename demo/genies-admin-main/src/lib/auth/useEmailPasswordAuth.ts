import {
  AuthV2NonAuthenticatedApi,
  SignInResponse,
} from 'src/lib/swagger/user/';
import { getApiConfig } from 'src/lib/swagger/user/util';
import { storeTokens } from 'src/lib/auth/tokens';

interface SignInParams {
  email: string;
  password: string;
}

export const useEmailPasswordAuth = () => {
  const api = new AuthV2NonAuthenticatedApi(getApiConfig());

  const signIn = async ({
    email,
    password,
  }: SignInParams): Promise<SignInResponse> => {
    try {
      const response = await api.signInV2({
        email,
        password,
      });

      if (response.accessToken && response.refreshToken) {
        storeTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      }

      return response;
    } catch (error: any) {
      const errorData = await error.json();
      throw new Error(errorData.error || `Failed to sign in`);
    }
  };

  return { signIn };
};
