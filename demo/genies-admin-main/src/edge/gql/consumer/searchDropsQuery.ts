import { gql } from '@apollo/client';

export const searchDropsQuery = gql`
  query searchDrops($searchInput: SearchDropsInput!) {
    searchDrops(input: $searchInput) {
      drops {
        __typename
        id
        title
        description
        imageURL
        creator {
          id
          name
          owner_id
          pref_username
          owner_sub_id
        }
        startTime
        endTime
      }
      pageInfo {
        nextCursor
      }
    }
  }
`;

export const searchDropTitleQuery = gql`
  query searchDropTitle($searchInput: SearchDropsInput!) {
    searchDrops(input: $searchInput) {
      drops {
        __typename
        id
        title
      }
    }
  }
`;

export const searchDropsWithEditionsQuery = gql`
  query searchDropsWithEditionsQuery($searchInput: SearchDropsInput!) {
    searchDrops(input: $searchInput) {
      drops {
        dropEditions {
          editionId
          dropPrice
          remainingCount
          remainingSaleCount
          remainingClaimCount
          edition {
            id
            flowID
            creatorID
            name
            retired
            size
            collectionFlowID
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
            }
            collection {
              flowID
              name
            }
            creator {
              id
              name
              owner_id
              pref_username
              owner_sub_id
            }
          }
        }
      }
    }
  }
`;
