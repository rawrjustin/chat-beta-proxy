import { gql } from '@apollo/client';

export const retireEditionMutation = gql`
  mutation retireEdition($input: RetireEditionInput!) {
    retireEdition(input: $input) {
      success
    }
  }
`;
