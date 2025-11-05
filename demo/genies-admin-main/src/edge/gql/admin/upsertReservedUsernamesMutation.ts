import { gql } from '@apollo/client';

export const upsertReserveUsernamesMutation = gql`
  mutation upsertReservedUsernames($input: UpsertReservedUsernamesInput!) {
    upsertReservedUsernames(input: $input) {
      count
      success {
        id
        username
        phoneNumber
      }
      failures {
        username
        phoneNumber
        errorMessage
      }
    }
  }
`;
