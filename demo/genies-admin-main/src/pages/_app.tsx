import App from 'next/app';
import type { AppProps } from 'next/app';
// eslint-disable-next-line no-restricted-imports
import { ChakraProvider } from '@chakra-ui/react';
import { LayoutWrapper } from 'src/general/components/Layout';
import { Fonts, theme } from 'src/theme';
import { MultiApolloProvider } from 'src/lib/apollo';
import Router from 'next/router';
import { auth, home } from 'src/modules/routes';
import { StatsigProvider } from 'statsig-react';
import * as uuid from 'uuid';
import React from 'react';
import {
  AuthProvider,
  getUserFromAccessToken,
  getValidAccessToken,
} from 'src/lib/auth';
import { UserProvider } from 'src/lib/user/UserContext';

function MyApp({ Component, pageProps }: AppProps<any>) {
  React.useEffect(() => {
    const cookieArr = document.cookie.split(';');

    cookieArr.forEach((cookie) => {
      const [name] = cookie.trim().split('=');
      if (name.includes('4co1pplip9ie6moeafi1rhdh5v')) {
        document.cookie = `${name}=; max-age=0; path=/;`;
      }
    });
  }, []);

  return (
    <AuthProvider initialIsAuthenticated={!!pageProps?.preLoadUser}>
      <UserProvider user={pageProps?.preLoadUser}>
        <MultiApolloProvider>
          <StatsigProvider
            sdkKey={process.env.NEXT_PUBLIC_STATSIG_CLIENT_SDK_KEY}
            user={{
              userID:
                pageProps?.preLoadUser?.userId ??
                pageProps?.preloadUser?.visitorUserId ??
                uuid.v4(),
              email: pageProps?.preloadUser?.email,
              custom: {
                phoneNumber: pageProps?.preloadUser?.phone_number,
              },
            }}
            waitForInitialization={true}
            options={{
              environment: {
                tier: process.env.NEXT_PUBLIC_STATSIG_ENVIRONMENT_TIER,
              },
            }}
          >
            <ChakraProvider theme={theme}>
              <Fonts />
              <LayoutWrapper>
                <Component {...pageProps} />
              </LayoutWrapper>
            </ChakraProvider>
          </StatsigProvider>
        </MultiApolloProvider>
      </UserProvider>
    </AuthProvider>
  );
}

const reroute = (res, destination) => {
  if (res) {
    res.writeHead(307, { Location: destination });
    res.end();
  } else {
    Router.replace(destination);
  }
};

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const { pathname, req, res } = appContext.ctx;
  let user = null;
  try {
    const accessToken = await getValidAccessToken(req, res);

    if (accessToken) {
      user = getUserFromAccessToken(accessToken);
    }
  } catch (error) {
    user = null;
    console.error('error getting valid access token', error);
  }

  if (user && pathname === auth()) {
    reroute(res, home());
  }

  if (!user && pathname !== auth()) {
    reroute(res, auth());
  }

  appProps.pageProps.preLoadUser = user;
  return { ...appProps };
};

export default MyApp;
