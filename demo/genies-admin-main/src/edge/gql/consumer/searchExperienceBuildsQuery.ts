import { gql } from '@apollo/client';

export const searchExperienceBuildsQuery = gql`
  query searchExperienceBuild($input: SearchExperienceBuildsInput!) {
    searchExperienceBuilds(input: $input) {
      builds {
        build {
          id
          status
          s3Url
          createdAt
          updatedAt
          reviewerId
        }
        experience {
          appClientId
        }
      }
    }
  }
`;
