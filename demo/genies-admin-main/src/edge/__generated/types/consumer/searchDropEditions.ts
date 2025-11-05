/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SearchDropEditionsInput } from './globalTypes';

// ====================================================
// GraphQL query operation: searchDropEditions
// ====================================================

export interface searchDropEditions_searchDropEditions_dropEditions_edition_collection {
  __typename: 'Collection';
  id: string;
}

export interface searchDropEditions_searchDropEditions_dropEditions_edition {
  __typename: 'Edition';
  collection: searchDropEditions_searchDropEditions_dropEditions_edition_collection | null;
}

export interface searchDropEditions_searchDropEditions_dropEditions {
  __typename: 'DropEdition';
  remainingClaimCount: number;
  remainingCount: number;
  remainingSaleCount: number;
  dropPrice: any;
  id: string;
  dropId: string;
  editionId: string;
  edition: searchDropEditions_searchDropEditions_dropEditions_edition | null;
}

export interface searchDropEditions_searchDropEditions {
  __typename: 'SearchDropEditionsResponse';
  dropEditions:
    | (searchDropEditions_searchDropEditions_dropEditions | null)[]
    | null;
}

export interface searchDropEditions {
  searchDropEditions: searchDropEditions_searchDropEditions | null;
}

export interface searchDropEditionsVariables {
  searchInput: SearchDropEditionsInput;
}
