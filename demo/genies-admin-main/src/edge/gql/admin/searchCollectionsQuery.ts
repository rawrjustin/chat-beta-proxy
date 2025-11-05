import { gql } from '@apollo/client';

export const searchCollectionsQuery = gql`
  query searchCollections($searchInput: AdminSearchCollectionsInput!) {
    searchCollections(input: $searchInput) {
      collections {
        id
        flowID
        name
        open
        editionsActive
        creatorID
        platformStatus
        metadata {
          description
        }
        series {
          id
          flowID
          name
        }
      }
      pageInfo {
        nextCursor
      }
    }
  }
`;
