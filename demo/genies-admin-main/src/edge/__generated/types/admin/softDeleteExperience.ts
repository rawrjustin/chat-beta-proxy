/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SoftDeleteExperienceInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: softDeleteExperience
// ====================================================

export interface softDeleteExperience_softDeleteExperience {
  __typename: 'SoftDeleteExperienceResponse';
  success: boolean;
}

export interface softDeleteExperience {
  softDeleteExperience: softDeleteExperience_softDeleteExperience | null;
}

export interface softDeleteExperienceVariables {
  input: SoftDeleteExperienceInput;
}
