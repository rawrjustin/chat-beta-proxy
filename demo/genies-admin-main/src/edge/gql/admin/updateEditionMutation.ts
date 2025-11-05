import { gql } from '@apollo/client';

export const updateEditionMutation = gql`
  mutation updateEdition($input: UpdateEditionInput!) {
    updateEdition(input: $input) {
      success
    }
  }
`;
