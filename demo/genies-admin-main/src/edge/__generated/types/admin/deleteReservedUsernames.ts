/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DeleteReservedUsernamesInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: deleteReservedUsernames
// ====================================================

export interface deleteReservedUsernames_deleteReservedUsernames {
  __typename: 'DeleteReservedUsernamesResponse';
  username: string | null;
}

export interface deleteReservedUsernames {
  deleteReservedUsernames: deleteReservedUsernames_deleteReservedUsernames | null;
}

export interface deleteReservedUsernamesVariables {
  input: DeleteReservedUsernamesInput;
}
