/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateEditionInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: updateEdition
// ====================================================

export interface updateEdition_updateEdition {
  __typename: 'UpdateEditionResponse';
  success: boolean;
}

export interface updateEdition {
  updateEdition: updateEdition_updateEdition | null;
}

export interface updateEditionVariables {
  input: UpdateEditionInput;
}
