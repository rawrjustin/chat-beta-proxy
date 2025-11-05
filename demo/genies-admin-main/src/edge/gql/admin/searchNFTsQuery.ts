import { gql } from '@apollo/client';

export const searchNFTsQuery = gql`
  query searchNFTs($searchInput: SearchNFTsInput!) {
    searchNFTs(input: $searchInput) {
      count
      nfts {
        flowID
      }
      pagination {
        leftCursor
        rightCursor
      }
    }
  }
`;
