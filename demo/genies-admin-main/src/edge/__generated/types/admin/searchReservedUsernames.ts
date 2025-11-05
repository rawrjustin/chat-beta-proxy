/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SearchReservedUsernamesInput } from './globalTypes';

// ====================================================
// GraphQL query operation: searchReservedUsernames
// ====================================================

export interface searchReservedUsernames_searchReservedUsernames_reservedUsernames {
  __typename: 'ReservedUsername';
  id: string | null;
  username: string | null;
  phoneNumber: string | null;
}

export interface searchReservedUsernames_searchReservedUsernames_pageInfo {
  __typename: 'PageInfo';
  nextCursor: any | null;
}

export interface searchReservedUsernames_searchReservedUsernames {
  __typename: 'SearchReservedUsernamesResponse';
  reservedUsernames:
    | (searchReservedUsernames_searchReservedUsernames_reservedUsernames | null)[]
    | null;
  pageInfo: searchReservedUsernames_searchReservedUsernames_pageInfo | null;
}

export interface searchReservedUsernames {
  searchReservedUsernames: searchReservedUsernames_searchReservedUsernames | null;
}

export interface searchReservedUsernamesVariables {
  searchInput: SearchReservedUsernamesInput;
}
