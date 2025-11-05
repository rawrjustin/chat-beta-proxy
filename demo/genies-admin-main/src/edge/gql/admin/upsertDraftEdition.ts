import { gql } from '@apollo/client';

export const upsertDraftEditionMutation = gql`
  mutation upsertEdition($input: UpsertEditionInput!) {
    upsertEdition(input: $input) {
      editionID
    }
  }
`;
