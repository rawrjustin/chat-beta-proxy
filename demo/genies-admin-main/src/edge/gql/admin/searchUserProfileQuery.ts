/**
 * Please add all admin API queries here
 */

import { gql } from '@apollo/client';

export const searchUserProfileQuery = gql`
  query searchUserProfile($searchInput: SearchUserProfileInput!) {
    searchUserProfile(input: $searchInput) {
      id
      username
      email
      phoneNumber
      geniesID
    }
  }
`;
