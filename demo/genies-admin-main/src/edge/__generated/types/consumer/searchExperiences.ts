/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SearchExperiencesInput } from './globalTypes';

// ====================================================
// GraphQL query operation: searchExperiences
// ====================================================

export interface searchExperiences_searchExperiences_pagination {
  __typename: 'PageInfo';
  nextCursor: any | null;
}

export interface searchExperiences_searchExperiences_experiences_builds {
  __typename: 'Build';
  id: string | null;
}

export interface searchExperiences_searchExperiences_experiences {
  __typename: 'Experience';
  id: string;
  description: string | null;
  name: string | null;
  version: string | null;
  ownerId: string | null;
  createdAt: any | null;
  updatedAt: any | null;
  builds:
    | (searchExperiences_searchExperiences_experiences_builds | null)[]
    | null;
}

export interface searchExperiences_searchExperiences {
  __typename: 'SearchExperiencesResponse';
  pagination: searchExperiences_searchExperiences_pagination | null;
  experiences:
    | (searchExperiences_searchExperiences_experiences | null)[]
    | null;
}

export interface searchExperiences {
  searchExperiences: searchExperiences_searchExperiences | null;
}

export interface searchExperiencesVariables {
  input: SearchExperiencesInput;
}
