import { Table, Tbody, Tr, Td, Text, Button } from 'src/theme';
import { TableInitialLoadingSkeleton } from 'src/general/datatable/TableInitialLoadingSkeleton';
import { FieldConfig, getValueByConfig } from '../collections';
import React from 'react';
import deleteThingsAdmin from 'src/edge/shim/deleteThingsAdmin';
import { things } from '../routes';
import { useRouter } from 'next/router';

const thingDetailsFormConfig: FieldConfig[] = [
  { label: 'Name', key: 'name' },
  { label: 'Creator ID', key: 'creatorId' },
  { label: 'Creator', key: 'creator' },
  { label: 'Creator Name', key: 'creatorName' },
  { label: 'Description', key: 'description' },
  { label: 'UUID', key: 'thingId' },
  { label: 'Updated At', key: 'lastModifiedAt' },
];

export type ThingDetailsProps = {
  name?: string;
  description?: string;
  thingId?: string;
  lastModifiedAt?: string;
  creatorId?: string;
  creator?: string;
  creatorName?: string;
};

export const ThingDetailsForm = ({
  loading,
  thingDetails,
}: {
  loading: boolean;
  thingDetails: ThingDetailsProps;
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteThing = async (thingId: string) => {
    try {
      setIsDeleting(true);
      await deleteThingsAdmin(thingId);
      setIsDeleting(false);
      router.push(things());
    } catch (error) {
      console.error(`deleteThing error: ${error.message}`);
    }
  };

  return (
    <Table>
      <Tbody>
        {loading || !thingDetails ? (
          <TableInitialLoadingSkeleton
            rowNum={thingDetailsFormConfig.length}
            columnNum={2}
          />
        ) : (
          <React.Fragment>
            {thingDetailsFormConfig.map((fieldConfig, index: number) => (
              <Tr key={index}>
                <Td maxW="2xs">
                  <Text w="full" textStyle="userDetailFont" color="gray.400">
                    {fieldConfig.label}
                  </Text>
                </Td>
                <Td maxW="xs">
                  {fieldConfig.render ? (
                    fieldConfig.render(
                      getValueByConfig(thingDetails, fieldConfig),
                    )
                  ) : (
                    <Text w="full" textStyle="userDetailFont" color="grey.600">
                      {getValueByConfig(thingDetails, fieldConfig)}
                    </Text>
                  )}
                </Td>
              </Tr>
            ))}
            <Button
              isLoading={isDeleting}
              mt={4}
              onClick={() => handleDeleteThing(thingDetails?.thingId)}
            >
              Delete Thing
            </Button>
          </React.Fragment>
        )}
      </Tbody>
    </Table>
  );
};
