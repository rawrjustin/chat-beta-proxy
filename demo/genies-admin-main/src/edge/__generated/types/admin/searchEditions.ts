/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  SearchEditionsInput,
  EditionDesignSlot,
  EditionRarity,
  EditionImageType,
} from './globalTypes';

// ====================================================
// GraphQL query operation: searchEditions
// ====================================================

export interface searchEditions_searchEditions_editions_metadata_images {
  __typename: 'EditionImage';
  type: EditionImageType;
  url: string;
}

export interface searchEditions_searchEditions_editions_metadata {
  __typename: 'EditionMetadata';
  publisher: string | null;
  description: string | null;
  designSlot: EditionDesignSlot | null;
  rarity: EditionRarity | null;
  images:
    | (searchEditions_searchEditions_editions_metadata_images | null)[]
    | null;
  avatarWearableSKU: string | null;
}

export interface searchEditions_searchEditions_editions_salesStats {
  __typename: 'EditionSalesStats';
  numForSale: number;
  numForClaim: number;
}

export interface searchEditions_searchEditions_editions_collection {
  __typename: 'Collection';
  name: string;
}

export interface searchEditions_searchEditions_editions_creator {
  __typename: 'Creator';
  id: string;
  name: string;
  owner_id: string;
  pref_username: string;
  owner_sub_id: string;
}

export interface searchEditions_searchEditions_editions {
  __typename: 'Edition';
  id: string;
  flowID: number;
  creatorID: string | null;
  name: string;
  retired: boolean;
  size: number | null;
  collectionFlowID: number;
  platformStatus: string | null;
  metadata: searchEditions_searchEditions_editions_metadata | null;
  salesStats: searchEditions_searchEditions_editions_salesStats | null;
  collection: searchEditions_searchEditions_editions_collection | null;
  creator: searchEditions_searchEditions_editions_creator | null;
}

export interface searchEditions_searchEditions {
  __typename: 'SearchEditionsResponse';
  count: number;
  editions: (searchEditions_searchEditions_editions | null)[] | null;
}

export interface searchEditions {
  searchEditions: searchEditions_searchEditions | null;
}

export interface searchEditionsVariables {
  searchInput: SearchEditionsInput;
}
