/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SearchNFTsInput } from './globalTypes';

// ====================================================
// GraphQL query operation: searchNFTs
// ====================================================

export interface searchNFTs_searchNFTs_nfts {
  __typename: 'NFT';
  flowID: number;
}

export interface searchNFTs_searchNFTs_pagination {
  __typename: 'Pagination';
  leftCursor: any | null;
  rightCursor: any | null;
}

export interface searchNFTs_searchNFTs {
  __typename: 'SearchNFTsResponse';
  count: number | null;
  nfts: (searchNFTs_searchNFTs_nfts | null)[] | null;
  pagination: searchNFTs_searchNFTs_pagination | null;
}

export interface searchNFTs {
  searchNFTs: searchNFTs_searchNFTs | null;
}

export interface searchNFTsVariables {
  searchInput: SearchNFTsInput;
}
