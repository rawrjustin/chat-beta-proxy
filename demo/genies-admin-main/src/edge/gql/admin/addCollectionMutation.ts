import { gql } from '@apollo/client';

export const addCollectionMutation = gql`
  mutation addCollection($input: AddCollectionInput!) {
    addCollection(input: $input) {
      success
      flowID
    }
  }
`;
