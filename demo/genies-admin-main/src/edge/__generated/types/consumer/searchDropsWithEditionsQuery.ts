/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  SearchDropsInput,
  EditionRarity,
  EditionImageType,
} from './globalTypes';

// ====================================================
// GraphQL query operation: searchDropsWithEditionsQuery
// ====================================================

export interface searchDropsWithEditionsQuery_searchDrops_drops_dropEditions_edition_metadata_images {
  __typename: 'EditionImage';
  type: EditionImageType;
  url: string;
}

export interface searchDropsWithEditionsQuery_searchDrops_drops_dropEditions_edition_metadata {
  __typename: 'EditionMetadata';
  rarity: EditionRarity | null;
  images:
    | (searchDropsWithEditionsQuery_searchDrops_drops_dropEditions_edition_metadata_images | null)[]
    | null;
}

export interface searchDropsWithEditionsQuery_searchDrops_drops_dropEditions_edition_salesStats {
  __typename: 'EditionSalesStats';
  numForSale: number;
}

export interface searchDropsWithEditionsQuery_searchDrops_drops_dropEditions_edition_collection {
  __typename: 'Collection';
  flowID: number;
  name: string;
}

export interface searchDropsWithEditionsQuery_searchDrops_drops_dropEditions_edition_creator {
  __typename: 'Creator';
  id: string;
  name: string;
  owner_id: string;
  pref_username: string;
  owner_sub_id: string;
}

export interface searchDropsWithEditionsQuery_searchDrops_drops_dropEditions_edition {
  __typename: 'Edition';
  id: string;
  flowID: number;
  creatorID: string | null;
  name: string;
  retired: boolean;
  size: number | null;
  collectionFlowID: number;
  platformStatus: string | null;
  metadata: searchDropsWithEditionsQuery_searchDrops_drops_dropEditions_edition_metadata | null;
  salesStats: searchDropsWithEditionsQuery_searchDrops_drops_dropEditions_edition_salesStats | null;
  collection: searchDropsWithEditionsQuery_searchDrops_drops_dropEditions_edition_collection | null;
  creator: searchDropsWithEditionsQuery_searchDrops_drops_dropEditions_edition_creator | null;
}

export interface searchDropsWithEditionsQuery_searchDrops_drops_dropEditions {
  __typename: 'DropEdition';
  editionId: string;
  dropPrice: any;
  remainingCount: number;
  remainingSaleCount: number;
  remainingClaimCount: number;
  edition: searchDropsWithEditionsQuery_searchDrops_drops_dropEditions_edition | null;
}

export interface searchDropsWithEditionsQuery_searchDrops_drops {
  __typename: 'Drop';
  dropEditions:
    | (searchDropsWithEditionsQuery_searchDrops_drops_dropEditions | null)[]
    | null;
}

export interface searchDropsWithEditionsQuery_searchDrops {
  __typename: 'SearchDropsResponse';
  drops: (searchDropsWithEditionsQuery_searchDrops_drops | null)[] | null;
}

export interface searchDropsWithEditionsQuery {
  searchDrops: searchDropsWithEditionsQuery_searchDrops | null;
}

export interface searchDropsWithEditionsQueryVariables {
  searchInput: SearchDropsInput;
}
