/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  SearchExperienceBuildsInput,
  ExperienceBuildStatus,
} from './globalTypes';

// ====================================================
// GraphQL query operation: searchExperienceBuild
// ====================================================

export interface searchExperienceBuild_searchExperienceBuilds_builds_build {
  __typename: 'Build';
  id: string | null;
  status: ExperienceBuildStatus | null;
  s3Url: string | null;
  createdAt: any | null;
  updatedAt: any | null;
  reviewerId: string | null;
}

export interface searchExperienceBuild_searchExperienceBuilds_builds_experience {
  __typename: 'Experience';
  appClientId: string | null;
}

export interface searchExperienceBuild_searchExperienceBuilds_builds {
  __typename: 'BuildExperience';
  build: searchExperienceBuild_searchExperienceBuilds_builds_build;
  experience: searchExperienceBuild_searchExperienceBuilds_builds_experience;
}

export interface searchExperienceBuild_searchExperienceBuilds {
  __typename: 'SearchExperienceBuildsResponse';
  builds: (searchExperienceBuild_searchExperienceBuilds_builds | null)[] | null;
}

export interface searchExperienceBuild {
  searchExperienceBuilds: searchExperienceBuild_searchExperienceBuilds | null;
}

export interface searchExperienceBuildVariables {
  input: SearchExperienceBuildsInput;
}
