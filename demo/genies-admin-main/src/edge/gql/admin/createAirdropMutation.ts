import { gql } from '@apollo/client';

export const createAirdropMutation = gql`
  mutation createAirdrop($input: CreateAirdropInput!) {
    createAirdrop(input: $input) {
      airdropResults {
        nftFlowID
        flowReceiverAddress
      }
    }
  }
`;
