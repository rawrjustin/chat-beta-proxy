/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { GetUserProfile } from './globalTypes';

// ====================================================
// GraphQL query operation: getUserProfile
// ====================================================

export interface getUserProfile_getUserProfile_creator {
  __typename: 'Creator';
  id: string;
  name: string;
  pref_username: string;
}

export interface getUserProfile_getUserProfile {
  __typename: 'UserPublicProfile';
  id: string | null;
  prefUsername: string | null;
  creator: getUserProfile_getUserProfile_creator | null;
}

export interface getUserProfile {
  getUserProfile: getUserProfile_getUserProfile;
}

export interface getUserProfileVariables {
  searchInput: GetUserProfile;
}
