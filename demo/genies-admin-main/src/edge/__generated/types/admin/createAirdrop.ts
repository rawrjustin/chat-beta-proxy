/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateAirdropInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: createAirdrop
// ====================================================

export interface createAirdrop_createAirdrop_airdropResults {
  __typename: 'AirdropResult';
  nftFlowID: number;
  flowReceiverAddress: string;
}

export interface createAirdrop_createAirdrop {
  __typename: 'CreateAirdropResponse';
  airdropResults: createAirdrop_createAirdrop_airdropResults[];
}

export interface createAirdrop {
  createAirdrop: createAirdrop_createAirdrop | null;
}

export interface createAirdropVariables {
  input: CreateAirdropInput;
}
