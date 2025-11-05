import {
  AuthV2NonAuthenticatedApi,
  StartMagicAuthResponse,
  VerifyMagicAuthResponse,
  ResendMagicAuthCodeResponse,
} from 'src/lib/swagger/user/';
import { getApiConfig } from 'src/lib/swagger/user/util';
import { storeTokens } from 'src/lib/auth/tokens';

interface StartMagicAuthParams {
  email: string;
}

interface StartMagicAuthResult {
  userExists: boolean;
  response?: StartMagicAuthResponse;
}

interface VerifyMagicAuthParams {
  email: string;
  code: string;
}

interface ResendMagicAuthParams {
  email: string;
}

export const useMagicAuth = () => {
  const api = new AuthV2NonAuthenticatedApi(getApiConfig());

  const startMagicAuth = async ({
    email,
  }: StartMagicAuthParams): Promise<StartMagicAuthResult> => {
    try {
      const response = await api.startMagicAuth({
        email,
      });

      return {
        userExists: true,
        response,
      };
    } catch (error: any) {
      const errorData = await error.json();

      // Check if the error is specifically about user not found
      if (errorData.error && errorData.error.includes('user not found')) {
        return {
          userExists: false,
        };
      }

      // For other errors, still throw them
      throw new Error(errorData.error || `Failed to start magic auth`);
    }
  };

  const verifyMagicAuth = async ({
    email,
    code,
  }: VerifyMagicAuthParams): Promise<VerifyMagicAuthResponse> => {
    try {
      const response = await api.verifyMagicAuth({
        email,
        code,
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
      throw new Error(errorData.error || `Failed to verify magic auth`);
    }
  };

  const resendMagicAuth = async ({
    email,
  }: ResendMagicAuthParams): Promise<ResendMagicAuthCodeResponse> => {
    try {
      const response = await api.resendMagicAuthCode({
        email,
      });

      return response;
    } catch (error: any) {
      const errorData = await error.json();
      throw new Error(errorData.error || `Failed to resend magic auth code`);
    }
  };

  return { startMagicAuth, verifyMagicAuth, resendMagicAuth };
};
