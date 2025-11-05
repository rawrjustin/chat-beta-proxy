/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  UpsertExperienceBuildInput,
  ExperienceBuildStatus,
} from './globalTypes';

// ====================================================
// GraphQL mutation operation: upsertExperienceBuild
// ====================================================

export interface upsertExperienceBuild_upsertExperienceBuild_build {
  __typename: 'Build';
  status: ExperienceBuildStatus | null;
}

export interface upsertExperienceBuild_upsertExperienceBuild {
  __typename: 'UpsertExperienceBuildResponse';
  build: upsertExperienceBuild_upsertExperienceBuild_build | null;
}

export interface upsertExperienceBuild {
  upsertExperienceBuild: upsertExperienceBuild_upsertExperienceBuild | null;
}

export interface upsertExperienceBuildVariables {
  input: UpsertExperienceBuildInput;
}
