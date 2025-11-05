/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SearchEditionsInput, EditionImageType } from './globalTypes';

// ====================================================
// GraphQL query operation: searchPublicEditions
// ====================================================

export interface searchPublicEditions_searchEditions_editions_metadata_images {
  __typename: 'EditionImage';
  type: EditionImageType;
  url: string;
}

export interface searchPublicEditions_searchEditions_editions_metadata {
  __typename: 'EditionMetadata';
  images:
    | (searchPublicEditions_searchEditions_editions_metadata_images | null)[]
    | null;
}

export interface searchPublicEditions_searchEditions_editions {
  __typename: 'Edition';
  id: string;
  name: string;
  dropEditionID: string | null;
  metadata: searchPublicEditions_searchEditions_editions_metadata | null;
}

export interface searchPublicEditions_searchEditions {
  __typename: 'SearchEditionsResponse';
  count: number;
  editions: (searchPublicEditions_searchEditions_editions | null)[] | null;
}

export interface searchPublicEditions {
  searchEditions: searchPublicEditions_searchEditions | null;
}

export interface searchPublicEditionsVariables {
  searchInput: SearchEditionsInput;
}
