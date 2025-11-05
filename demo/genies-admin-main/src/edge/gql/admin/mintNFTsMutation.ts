import { gql } from '@apollo/client';

export const mintNFTsMutation = gql`
  mutation mintNFTs($input: MintNFTsInput!) {
    mintNFTs(input: $input) {
      success
      mintedNFTs {
        editionFlowID
        nftFlowID
      }
    }
  }
`;
