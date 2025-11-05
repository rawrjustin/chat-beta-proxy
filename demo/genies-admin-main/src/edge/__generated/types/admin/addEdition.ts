/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddEditionInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: addEdition
// ====================================================

export interface addEdition_addEdition {
  __typename: 'AddEditionResponse';
  success: boolean;
  flowID: number | null;
  editionID: string;
}

export interface addEdition {
  addEdition: addEdition_addEdition | null;
}

export interface addEditionVariables {
  input: AddEditionInput;
}
