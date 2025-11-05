/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SearchDropsInput } from './globalTypes';

// ====================================================
// GraphQL query operation: searchDropTitle
// ====================================================

export interface searchDropTitle_searchDrops_drops {
  __typename: 'Drop';
  id: string;
  title: string | null;
}

export interface searchDropTitle_searchDrops {
  __typename: 'SearchDropsResponse';
  drops: (searchDropTitle_searchDrops_drops | null)[] | null;
}

export interface searchDropTitle {
  searchDrops: searchDropTitle_searchDrops | null;
}

export interface searchDropTitleVariables {
  searchInput: SearchDropsInput;
}
