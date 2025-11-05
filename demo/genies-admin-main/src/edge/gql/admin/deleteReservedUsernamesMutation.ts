import { gql } from '@apollo/client';

export const deleteReservedUsernamesMutation = gql`
  mutation deleteReservedUsernames($input: DeleteReservedUsernamesInput!) {
    deleteReservedUsernames(input: $input) {
      username
    }
  }
`;
