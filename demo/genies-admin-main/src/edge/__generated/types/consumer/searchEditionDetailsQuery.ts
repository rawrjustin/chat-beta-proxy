/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  SearchEditionsInput,
  EditionRarity,
  EditionImageType,
} from './globalTypes';

// ====================================================
// GraphQL query operation: searchEditionDetailsQuery
// ====================================================

export interface searchEditionDetailsQuery_searchEditions_editions_creator {
  __typename: 'Creator';
  id: string;
}

export interface searchEditionDetailsQuery_searchEditions_editions_collection {
  __typename: 'Collection';
  id: string;
  name: string;
  flowID: number;
}

export interface searchEditionDetailsQuery_searchEditions_editions_metadata_images {
  __typename: 'EditionImage';
  type: EditionImageType;
  url: string;
}

export interface searchEditionDetailsQuery_searchEditions_editions_metadata {
  __typename: 'EditionMetadata';
  rarity: EditionRarity | null;
  images:
    | (searchEditionDetailsQuery_searchEditions_editions_metadata_images | null)[]
    | null;
}

export interface searchEditionDetailsQuery_searchEditions_editions_salesStats {
  __typename: 'EditionSalesStats';
  numForSale: number;
  numForClaim: number;
}

export interface searchEditionDetailsQuery_searchEditions_editions {
  __typename: 'Edition';
  creator: searchEditionDetailsQuery_searchEditions_editions_creator | null;
  collection: searchEditionDetailsQuery_searchEditions_editions_collection | null;
  id: string;
  name: string;
  dropEditionID: string | null;
  flowID: number;
  size: number | null;
  platformStatus: string | null;
  metadata: searchEditionDetailsQuery_searchEditions_editions_metadata | null;
  salesStats: searchEditionDetailsQuery_searchEditions_editions_salesStats | null;
}

export interface searchEditionDetailsQuery_searchEditions {
  __typename: 'SearchEditionsResponse';
  editions: (searchEditionDetailsQuery_searchEditions_editions | null)[] | null;
}

export interface searchEditionDetailsQuery {
  searchEditions: searchEditionDetailsQuery_searchEditions | null;
}

export interface searchEditionDetailsQueryVariables {
  searchInput: SearchEditionsInput;
}
