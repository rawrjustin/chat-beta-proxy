import { searchExperiences_searchExperiences_experiences } from 'src/edge/__generated/types/consumer/searchExperiences';
import { Table, Tbody, Tr, Td, Text, Button } from 'src/theme';
import { TableInitialLoadingSkeleton } from 'src/general/datatable/TableInitialLoadingSkeleton';
import { FieldConfig, getValueByConfig } from '../../collections';
import { FormatUTCToPDT } from 'src/general/components/DateTime';
import React from 'react';
import { softDeleteExperienceMutation } from 'src/edge/gql/admin/softDeleteExperienceMutation';
import { useMutation } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { useRouter } from 'next/router';
import { experiences } from 'src/modules/routes';

const experienceDetailsFormConfig: FieldConfig[] = [
  { label: 'Name', key: 'name' },
  { label: 'Description', key: 'description' },
  { label: 'ID', key: 'id' },
  { label: 'Version', key: 'version' },
  { label: 'Owner ID', key: 'ownerId' },
  {
    label: 'Created At',
    key: 'createdAt',
    render: (v: string) => <FormatUTCToPDT date={v} contentColor="grey.600" />,
  },
  {
    label: 'Updated At',
    key: 'updatedAt',
    render: (v: string) => <FormatUTCToPDT date={v} contentColor="grey.600" />,
  },
];

export const ExperienceDetailsForm = ({
  loading,
  experienceDetails,
}: {
  loading: boolean;
  experienceDetails: searchExperiences_searchExperiences_experiences;
}) => {
  const adminClient = useAdminClient();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [softDeleteExperience] = useMutation(softDeleteExperienceMutation, {
    client: adminClient,
  });

  const handleDeleteExperience = async (id: string) => {
    try {
      setIsDeleting(true);
      let payload = {
        variables: {
          input: {
            id,
          },
        },
      };

      await softDeleteExperience(payload);
      router.push(experiences());
    } catch (error) {
      console.error(`deleteExperience error: ${error.message}`);
    }
  };

  return (
    <Table>
      <Tbody>
        {loading || !experienceDetails ? (
          <TableInitialLoadingSkeleton
            rowNum={experienceDetailsFormConfig.length}
            columnNum={2}
          />
        ) : (
          <React.Fragment>
            {experienceDetailsFormConfig.map((fieldConfig, index: number) => (
              <Tr key={index}>
                <Td maxW="2xs">
                  <Text w="full" textStyle="userDetailFont" color="gray.400">
                    {fieldConfig.label}
                  </Text>
                </Td>
                <Td maxW="xs">
                  {fieldConfig.render ? (
                    fieldConfig.render(
                      getValueByConfig(experienceDetails, fieldConfig),
                    )
                  ) : (
                    <Text w="full" textStyle="userDetailFont" color="grey.600">
                      {getValueByConfig(experienceDetails, fieldConfig)}
                    </Text>
                  )}
                </Td>
              </Tr>
            ))}
            <Button
              isLoading={isDeleting}
              mt={4}
              onClick={() => handleDeleteExperience(experienceDetails?.id)}
            >
              Delete Experience
            </Button>
          </React.Fragment>
        )}
      </Tbody>
    </Table>
  );
};
