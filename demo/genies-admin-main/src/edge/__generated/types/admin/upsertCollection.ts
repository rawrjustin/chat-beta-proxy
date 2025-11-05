/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpsertCollectionInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: upsertCollection
// ====================================================

export interface upsertCollection_upsertCollection {
  __typename: 'UpsertCollectionResponse';
  collectionID: string;
}

export interface upsertCollection {
  upsertCollection: upsertCollection_upsertCollection | null;
}

export interface upsertCollectionVariables {
  input: UpsertCollectionInput;
}
