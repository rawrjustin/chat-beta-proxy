import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { clearTokens, getTokens, isTokenExpired } from './tokens';
import { useRefreshAccessToken } from './useRefreshAccessToken';
import { auth } from 'src/modules/routes';

interface AuthContextType extends AuthState {
  signOut: () => void;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: Error;
}

const AuthStateContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  initialIsAuthenticated = false,
}: {
  children: ReactNode;
  initialIsAuthenticated?: boolean;
}) => {
  const { refreshAccessToken } = useRefreshAccessToken();
  const { accessToken } = getTokens();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: initialIsAuthenticated,
    isLoading: true,
  });

  const signOut = () => {
    clearTokens();
    window.location.href = auth();
  };

  useEffect(() => {
    const initAuth = async () => {
      let authenticated = accessToken && !isTokenExpired(accessToken);
      let error: Error | undefined = undefined;

      try {
        if (!authenticated) {
          await refreshAccessToken();
          authenticated = true;
        }
      } catch (err) {
        authenticated = false;
        error = new Error('Session expired. Please log in again.');
      }

      setAuthState({
        isAuthenticated: authenticated,
        isLoading: false,
        error,
      });
    };

    initAuth();
  }, []);

  useEffect(() => {
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: initialIsAuthenticated,
    }));
  }, [initialIsAuthenticated]);

  const value = {
    ...authState,
    signOut,
  };

  return (
    <AuthStateContext.Provider value={value}>
      {children}
    </AuthStateContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
