/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SearchDropsInput } from './globalTypes';

// ====================================================
// GraphQL query operation: searchDrops
// ====================================================

export interface searchDrops_searchDrops_drops_creator {
  __typename: 'Creator';
  id: string;
  name: string;
  owner_id: string;
  pref_username: string;
  owner_sub_id: string;
}

export interface searchDrops_searchDrops_drops {
  __typename: 'Drop';
  id: string;
  title: string | null;
  description: string | null;
  imageURL: string | null;
  creator: searchDrops_searchDrops_drops_creator | null;
  startTime: any | null;
  endTime: any | null;
}

export interface searchDrops_searchDrops_pageInfo {
  __typename: 'PageInfo';
  nextCursor: any | null;
}

export interface searchDrops_searchDrops {
  __typename: 'SearchDropsResponse';
  drops: (searchDrops_searchDrops_drops | null)[] | null;
  pageInfo: searchDrops_searchDrops_pageInfo | null;
}

export interface searchDrops {
  searchDrops: searchDrops_searchDrops | null;
}

export interface searchDropsVariables {
  searchInput: SearchDropsInput;
}
