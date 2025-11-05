import { gql } from '@apollo/client';

export const closeCollectionMutation = gql`
  mutation closeCollection($input: CloseCollectionInput!) {
    closeCollection(input: $input) {
      success
    }
  }
`;
