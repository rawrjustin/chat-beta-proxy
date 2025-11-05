import * as React from 'react';
import { useContext, createContext } from 'react';
import { initializeApollo } from 'src/lib/apollo/initApolloClient';

const CONSUMER_SERVER_URL = process.env.NEXT_PUBLIC_CONSUMER_API_URI;
const ADMIN_SERVER_URL = process.env.NEXT_PUBLIC_ADMIN_API_URI;

const consumerClient = initializeApollo(CONSUMER_SERVER_URL, {});
const adminClient = initializeApollo(ADMIN_SERVER_URL, {});

const MultiApolloContext = createContext({ consumerClient, adminClient });

export const MultiApolloProvider = ({
  children,
}: {
  children: React.ReactChild;
}) => {
  return (
    <MultiApolloContext.Provider value={{ consumerClient, adminClient }}>
      {children}
    </MultiApolloContext.Provider>
  );
};

export const useConsumerClient = () => {
  const allClients = useContext(MultiApolloContext);
  return allClients.consumerClient;
};

export const useAdminClient = () => {
  const allClients = useContext(MultiApolloContext);
  return allClients.adminClient;
};
