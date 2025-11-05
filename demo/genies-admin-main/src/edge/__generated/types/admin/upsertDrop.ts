/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpsertDropInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: upsertDrop
// ====================================================

export interface upsertDrop_upsertDrop {
  __typename: 'UpsertDropResponse';
  dropID: string | null;
}

export interface upsertDrop {
  upsertDrop: upsertDrop_upsertDrop | null;
}

export interface upsertDropVariables {
  input: UpsertDropInput;
}
