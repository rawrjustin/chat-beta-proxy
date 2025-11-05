import { gql } from '@apollo/client';

export const sellItemsMutation = gql`
  mutation sellItems($input: SellItemsInput!) {
    sellItems(input: $input) {
      success
      txID
    }
  }
`;
