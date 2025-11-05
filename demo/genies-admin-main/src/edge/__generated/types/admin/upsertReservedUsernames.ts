/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpsertReservedUsernamesInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: upsertReservedUsernames
// ====================================================

export interface upsertReservedUsernames_upsertReservedUsernames_success {
  __typename: 'ReservedUsername';
  id: string | null;
  username: string | null;
  phoneNumber: string | null;
}

export interface upsertReservedUsernames_upsertReservedUsernames_failures {
  __typename: 'ReservedUsernameFailureResponse';
  username: string | null;
  phoneNumber: string | null;
  errorMessage: string | null;
}

export interface upsertReservedUsernames_upsertReservedUsernames {
  __typename: 'UpsertReservedUsernamesResponse';
  count: number;
  success: upsertReservedUsernames_upsertReservedUsernames_success[];
  failures: upsertReservedUsernames_upsertReservedUsernames_failures[];
}

export interface upsertReservedUsernames {
  upsertReservedUsernames: upsertReservedUsernames_upsertReservedUsernames;
}

export interface upsertReservedUsernamesVariables {
  input: UpsertReservedUsernamesInput;
}
