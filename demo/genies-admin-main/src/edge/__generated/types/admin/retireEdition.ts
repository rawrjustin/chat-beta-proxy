/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RetireEditionInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: retireEdition
// ====================================================

export interface retireEdition_retireEdition {
  __typename: 'RetireEditionResponse';
  success: boolean;
}

export interface retireEdition {
  retireEdition: retireEdition_retireEdition | null;
}

export interface retireEditionVariables {
  input: RetireEditionInput;
}
