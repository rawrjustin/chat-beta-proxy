import { gql } from '@apollo/client';

export const searchEditionsQuery = gql`
  query searchEditions($searchInput: SearchEditionsInput!) {
    searchEditions(input: $searchInput) {
      count
      editions {
        id
        flowID
        creatorID
        name
        retired
        size
        collectionFlowID
        platformStatus
        metadata {
          publisher
          description
          designSlot
          rarity
          images {
            type
            url
          }
          avatarWearableSKU
        }
        salesStats {
          numForSale
          numForClaim
        }
        collection {
          name
        }
        creator {
          id
          name
          owner_id
          pref_username
          owner_sub_id
        }
        platformStatus
      }
    }
  }
`;

export const searchPublicEditionsQuery = gql`
  query searchPublicEditions($searchInput: SearchEditionsInput!) {
    searchEditions(input: $searchInput) {
      count
      editions {
        id
        name
        dropEditionID
        metadata {
          images {
            type
            url
          }
        }
      }
    }
  }
`;
