import { gql } from '@apollo/client';

export const upsertExperienceBuildMutation = gql`
  mutation upsertExperienceBuild($input: UpsertExperienceBuildInput!) {
    upsertExperienceBuild(input: $input) {
      build {
        status
      }
    }
  }
`;
