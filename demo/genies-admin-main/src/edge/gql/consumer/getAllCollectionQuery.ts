/**
 * Please add all consumer API queries here
 */
import { gql } from '@apollo/client';

export const getAllCollectionQuery = gql`
  query getAllCollection {
    getAllCollections {
      collections {
        id
        name
      }
    }
  }
`;
