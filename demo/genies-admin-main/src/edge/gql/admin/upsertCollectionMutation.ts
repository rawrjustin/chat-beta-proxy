import { gql } from '@apollo/client';

export const upsertCollectionMutation = gql`
  mutation upsertCollection($input: UpsertCollectionInput!) {
    upsertCollection(input: $input) {
      collectionID
    }
  }
`;
