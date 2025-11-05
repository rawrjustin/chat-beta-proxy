import { gql } from '@apollo/client';

export const getUserProfileQuery = gql`
  query getUserProfile($searchInput: GetUserProfile!) {
    getUserProfile(input: $searchInput) {
      id
      prefUsername
      firstName
      lastName
      creator {
        id
        name
        pref_username
      }
    }
  }
`;
