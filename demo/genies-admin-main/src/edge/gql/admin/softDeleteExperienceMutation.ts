import { gql } from '@apollo/client';

export const softDeleteExperienceMutation = gql`
  mutation softDeleteExperience($input: SoftDeleteExperienceInput!) {
    softDeleteExperience(input: $input) {
      success
    }
  }
`;
