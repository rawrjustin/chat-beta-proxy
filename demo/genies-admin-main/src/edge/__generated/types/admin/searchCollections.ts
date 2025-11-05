/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AdminSearchCollectionsInput } from './globalTypes';

// ====================================================
// GraphQL query operation: searchCollections
// ====================================================

export interface searchCollections_searchCollections_collections_metadata {
  __typename: 'CollectionMetadata';
  description: string | null;
}

export interface searchCollections_searchCollections_collections_series {
  __typename: 'Series';
  id: string;
  flowID: number;
  name: string;
}

export interface searchCollections_searchCollections_collections {
  __typename: 'Collection';
  id: string;
  flowID: number;
  name: string;
  open: boolean;
  editionsActive: number;
  creatorID: string | null;
  platformStatus: string | null;
  metadata: searchCollections_searchCollections_collections_metadata | null;
  series: searchCollections_searchCollections_collections_series | null;
}

export interface searchCollections_searchCollections_pageInfo {
  __typename: 'PageInfo';
  nextCursor: any | null;
}

export interface searchCollections_searchCollections {
  __typename: 'SearchCollectionsResponse';
  collections:
    | (searchCollections_searchCollections_collections | null)[]
    | null;
  pageInfo: searchCollections_searchCollections_pageInfo | null;
}

export interface searchCollections {
  searchCollections: searchCollections_searchCollections | null;
}

export interface searchCollectionsVariables {
  searchInput: AdminSearchCollectionsInput;
}
