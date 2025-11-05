import { gql } from '@apollo/client';

export const searchEditionDetailsQuery = gql`
  query searchEditionDetailsQuery($searchInput: SearchEditionsInput!) {
    searchEditions(input: $searchInput) {
      editions {
        creator {
          id
        }
        collection {
          id
          name
          flowID
        }
        id
        name
        dropEditionID
        flowID
        size
        platformStatus
        metadata {
          rarity
          images {
            type
            url
          }
        }
        salesStats {
          numForSale
          numForClaim
        }
      }
    }
  }
`;
