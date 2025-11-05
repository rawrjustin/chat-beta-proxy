import { gql } from '@apollo/client';

export const updateCollectionMutation = gql`
  mutation updateCollection($input: UpdateCollectionInput!) {
    updateCollection(input: $input) {
      success
    }
  }
`;
