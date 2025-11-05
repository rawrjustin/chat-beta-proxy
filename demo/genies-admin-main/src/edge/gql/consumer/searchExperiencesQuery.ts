import { gql } from '@apollo/client';

export const searchExperiencesQuery = gql`
  query searchExperiences($input: SearchExperiencesInput!) {
    searchExperiences(input: $input) {
      pagination {
        nextCursor
      }
      experiences {
        id
        description
        name
        version
        ownerId
        createdAt
        updatedAt
        builds {
          id
        }
      }
    }
  }
`;
