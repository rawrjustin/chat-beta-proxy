/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddCollectionInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: addCollection
// ====================================================

export interface addCollection_addCollection {
  __typename: 'AddCollectionResponse';
  success: boolean;
  flowID: number;
}

export interface addCollection {
  addCollection: addCollection_addCollection | null;
}

export interface addCollectionVariables {
  input: AddCollectionInput;
}
