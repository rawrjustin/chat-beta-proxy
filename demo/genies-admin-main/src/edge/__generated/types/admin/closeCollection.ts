/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CloseCollectionInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: closeCollection
// ====================================================

export interface closeCollection_closeCollection {
  __typename: 'CloseCollectionResponse';
  success: boolean;
}

export interface closeCollection {
  closeCollection: closeCollection_closeCollection | null;
}

export interface closeCollectionVariables {
  input: CloseCollectionInput;
}
