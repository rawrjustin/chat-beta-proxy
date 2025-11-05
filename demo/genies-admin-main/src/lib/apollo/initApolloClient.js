import { useMemo } from 'react';
import merge from 'deepmerge';
import { ApolloClient, HttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/link-context';
import { createTimingLink } from './timingLink';
import { createCache } from './cache';
import { datadogLink } from './datadogLink';
import Logger from 'shared/logger';
import { requestWithSignature } from 'src/edge/signature/requestWithSignature';
import { ACCESS_TOKEN_KEY } from 'src/lib/auth';
import { getClientHash } from 'src/general/utils/getClientHash';

const AUTH_HEADER = 'authorization';
const CLIENT_HASH_HEADER = 'x-client-hash';
const ADMIN_AUTH_TOKEN = process.env.NEXT_PUBLIC_ADMIN_SERVER_AUTH_TOKEN;

let apolloClient = {};

function createLink(serverUrl, ctx) {
  const getToken = async () => {
    if (serverUrl.includes('admin')) {
      return {
        [AUTH_HEADER]: 'Bearer ' + ADMIN_AUTH_TOKEN,
      };
    }
    if (serverUrl.includes('consumer')) {
      try {
        let accessToken = null;
        if (typeof window === 'undefined') {
          const cookie = require('cookie');
          const cookies = cookie.parse(ctx?.req?.headers?.cookie || '');
          accessToken = cookies[ACCESS_TOKEN_KEY] || null;
        } else {
          accessToken =
            document.cookie
              .split('; ')
              .find((row) => row.startsWith('access_token='))
              ?.split('=')[1] || null;
        }

        if (!accessToken) {
          throw new Error('Could not get access token from user');
        }
        return {
          [AUTH_HEADER]: `Bearer ${accessToken}`,
        };
      } catch (e) {
        // Todo: Auth.currentSession() has bug which will throw undefined error, fixed in amplify >  4.3.16
        if (typeof e == 'undefined') return null;
        const errorMessage = e?.message ?? e.toString();
        // Compress the error log for the common no user cases.
        if (
          errorMessage.include('No current user') ||
          errorMessage.include('Refresh Token has expired')
        ) {
          return {};
        }
        Logger.getInstance().error(`getToken error: ${errorMessage}`, {
          ...ctx,
          errorMessage: errorMessage,
          source: 'initializeApolloClient getToken',
        });
        return {};
      }
    }
    return {};
  };

  /**
   * withToken context link
   * This uses the setContext function from the apollo-link-context to get the
   * user's id token and pass it along with the req headers if it exists.
   * https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-context
   */
  const withTokenLink = setContext(async (req, { headers }) => {
    try {
      const token = await getToken();
      return {
        headers: {
          ...headers,
          ...token,
        },
      };
    } catch (error) {
      Logger.getInstance().error(
        'Failed to set user id token to apollo-link-context',
        {
          errorMessage: error.message,
          source: 'initializeApolloClient: withTokenLink',
        },
      );
    } // @note: no need to catch this error
    return {};
  });

  // This will log out and record times for queries. timingCache is appended to
  // client instance so it can be captured and added to prop in withApollo.
  const { timingLink } =
    process.env.NODE_ENV === 'development' ? createTimingLink() : {};

  /**
   * The http link is a terminating link that fetches GraphQL results from
   * a GraphQL endpoint over an http connection. As such, it must be the last
   * link in the configuration.
   */
  const httpLinkUri = serverUrl;

  const withSignatureLink = setContext(async (req, { headers }) => {
    try {
      const { hash, nonce } = await requestWithSignature(req);
      const clientHash = await getClientHash();

      return {
        headers: {
          ...headers,
          ...(hash && { 'x-signature': hash, 'x-nonce': nonce.toString() }),
          ...(httpLinkUri.includes('consumer') && clientHash
            ? {
                [CLIENT_HASH_HEADER]: clientHash,
              }
            : {}),
        },
      };
    } catch (error) {} // @note: no need to catch this error
    return {};
  });

  return from([
    ...(timingLink ? [timingLink] : []),
    datadogLink(ctx),
    withTokenLink,
    withSignatureLink,
    split(
      (operation) => operation.getContext().clientName === 'mockAPI',
      new HttpLink({
        uri: ({ operationName }) => `/api/graphql?${operationName}`,
        credentials: 'same-origin',
        fetch,
      }),
      new HttpLink({
        uri: ({ operationName }) => `${httpLinkUri}?${operationName}`,
        credentials: 'same-origin',
        fetch,
      }),
    ),
  ]);
}

function createApolloClient(serverUrl, initialState = {}, context) {
  const { timingCache } =
    process.env.NODE_ENV === 'development' ? createTimingLink() : {};

  const newApolloClient = new ApolloClient({
    link: createLink(serverUrl, context),
    cache: createCache().restore(initialState),
    connectToDevTools: typeof window !== 'undefined', // Only connect to devtools in client
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'ignore',
      },
      query: {
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    ssrMode: typeof window === 'undefined', // Disables forceFetch on the server (so queries are only run once),
  });

  newApolloClient.timingCache = timingCache;
  return newApolloClient;
}

export function initializeApollo(serverUrl, initialState = {}, context = null) {
  // the following is based on:
  // https://github.com/vercel/next.js/blob/4bbdd090973ca167d364f3ab8ccdbcbfb9ffbbb5/examples/api-routes-apollo-server-and-client-auth/apollo/client.js
  const _apolloClient =
    apolloClient[serverUrl] ??
    createApolloClient(serverUrl, initialState, context);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache);

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }

  // Server Side need the ctx to get the token
  // Always create the new client
  if (typeof window === 'undefined') return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient[serverUrl]) apolloClient[serverUrl] = _apolloClient;

  return _apolloClient;
}

export function useApollo(serverUrl, initialState) {
  const store = useMemo(
    () => initializeApollo(serverUrl, initialState),
    [serverUrl, initialState],
  );
  return store;
}
