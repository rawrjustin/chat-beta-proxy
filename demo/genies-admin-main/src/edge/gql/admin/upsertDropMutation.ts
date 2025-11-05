import { gql } from '@apollo/client';

export const upsertDropMutation = gql`
  mutation upsertDrop($input: UpsertDropInput!) {
    upsertDrop(input: $input) {
      dropID
    }
  }
`;
