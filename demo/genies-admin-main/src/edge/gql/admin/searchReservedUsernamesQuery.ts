import { gql } from '@apollo/client';

export const searchReservedUsernamesQuery = gql`
  query searchReservedUsernames($searchInput: SearchReservedUsernamesInput!) {
    searchReservedUsernames(input: $searchInput) {
      reservedUsernames {
        id
        username
        phoneNumber
      }
      pageInfo {
        nextCursor
      }
    }
  }
`;
