/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateCollectionInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: updateCollection
// ====================================================

export interface updateCollection_updateCollection {
  __typename: 'UpdateCollectionResponse';
  success: boolean;
}

export interface updateCollection {
  updateCollection: updateCollection_updateCollection | null;
}

export interface updateCollectionVariables {
  input: UpdateCollectionInput;
}
