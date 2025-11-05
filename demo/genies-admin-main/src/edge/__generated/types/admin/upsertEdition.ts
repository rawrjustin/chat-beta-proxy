/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpsertEditionInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: upsertEdition
// ====================================================

export interface upsertEdition_upsertEdition {
  __typename: 'UpsertEditionResponse';
  editionID: string;
}

export interface upsertEdition {
  upsertEdition: upsertEdition_upsertEdition | null;
}

export interface upsertEditionVariables {
  input: UpsertEditionInput;
}
