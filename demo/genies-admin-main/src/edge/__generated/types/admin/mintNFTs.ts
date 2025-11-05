/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MintNFTsInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: mintNFTs
// ====================================================

export interface mintNFTs_mintNFTs_mintedNFTs {
  __typename: 'MintNFTsOrderResponse';
  editionFlowID: number | null;
  nftFlowID: number | null;
}

export interface mintNFTs_mintNFTs {
  __typename: 'MintNFTsResponse';
  success: boolean;
  mintedNFTs: (mintNFTs_mintNFTs_mintedNFTs | null)[];
}

export interface mintNFTs {
  mintNFTs: mintNFTs_mintNFTs | null;
}

export interface mintNFTsVariables {
  input: MintNFTsInput;
}
