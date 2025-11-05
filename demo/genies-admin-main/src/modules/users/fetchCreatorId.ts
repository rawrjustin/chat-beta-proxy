import { ApolloClient } from '@apollo/client';
import { getUserProfileQuery } from 'src/edge/gql/consumer/getUserProfileQuery';

export const fetchCreatorId = async (
  client: ApolloClient<object>,
  prefUsername: string,
) => {
  let creatorId = null;
  try {
    const res = await client.query({
      query: getUserProfileQuery,
      variables: { searchInput: { prefUsername: prefUsername.trim() } },
    });
    return res?.data?.getUserProfile?.creator?.id;
  } catch (e) {
    return creatorId;
  }
};
