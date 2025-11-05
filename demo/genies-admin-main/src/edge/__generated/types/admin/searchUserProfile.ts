/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SearchUserProfileInput } from './globalTypes';

// ====================================================
// GraphQL query operation: searchUserProfile
// ====================================================

export interface searchUserProfile_searchUserProfile {
  __typename: 'UserProfile';
  id: string | null;
  username: string | null;
  email: string | null;
  phoneNumber: string | null;
  geniesID: string | null;
}

export interface searchUserProfile {
  searchUserProfile: searchUserProfile_searchUserProfile | null;
}

export interface searchUserProfileVariables {
  searchInput: SearchUserProfileInput;
}
