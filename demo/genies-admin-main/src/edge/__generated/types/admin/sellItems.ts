/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SellItemsInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: sellItems
// ====================================================

export interface sellItems_sellItems {
  __typename: 'SellItemsResponse';
  success: boolean;
  txID: string;
}

export interface sellItems {
  sellItems: sellItems_sellItems | null;
}

export interface sellItemsVariables {
  input: SellItemsInput;
}
