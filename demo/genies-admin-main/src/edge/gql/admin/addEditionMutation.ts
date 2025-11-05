import { gql } from '@apollo/client';

export const addEditionMutation = gql`
  mutation addEdition($input: AddEditionInput!) {
    addEdition(input: $input) {
      success
      flowID
      editionID
    }
  }
`;
