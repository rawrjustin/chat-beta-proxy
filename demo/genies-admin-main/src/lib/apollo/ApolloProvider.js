import PropTypes from 'prop-types';
import { ApolloProvider as ApolloClientProvider } from '@apollo/client';
import { useApollo } from 'src/lib/apollo/initApolloClient';

const CONSUMER_SERVER_URL = process.env.NEXT_PUBLIC_CONSUMER_API_URI;

const ApolloProvider = ({ initialState, ...props }) => {
  // create new apollo client
  const apolloClient = useApollo(CONSUMER_SERVER_URL, initialState);

  return <ApolloClientProvider client={apolloClient} {...props} />;
};

ApolloProvider.propTypes = {
  initialState: PropTypes.object,
};

ApolloProvider.defaultProps = {
  initialState: undefined,
};

export { ApolloProvider };
