import { gql } from '@apollo/client';

export const searchDropEditionsQuery = gql`
  query searchDropEditions($searchInput: SearchDropEditionsInput!) {
    searchDropEditions(input: $searchInput) {
      dropEditions {
        remainingClaimCount
        remainingCount
        remainingSaleCount
        dropPrice
        id
        dropId
        editionId
        edition {
          collection {
            id
          }
        }
      }
    }
  }
`;
