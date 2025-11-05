import React, { useState } from 'react';
import { Table, Tbody, Tr, Td, Text, Container, useToast } from 'src/theme';
import { FieldConfig } from 'src/modules/collections/details/CollectionDetailForm';
import { Status } from 'src/general/components/Status';
import { useMutation, useQuery } from '@apollo/client';
import {
  useConsumerClient,
  useAdminClient,
} from 'src/lib/apollo/MultiApolloProvider';
import { searchDropsQuery } from 'src/edge/gql/consumer/searchDropsQuery';
import { DropStatus } from 'src/edge/__generated/types/consumer/globalTypes';
import Logger from 'shared/logger';
import { formatDropData } from 'src/modules/drops/DropType';
import { TableInitialLoadingSkeleton } from 'src/general/datatable/TableInitialLoadingSkeleton';
import { getValueByConfig } from 'src/modules/collections';
import { Creator } from 'src/general/components/Creator';
import { TableRowActions } from 'src/general/infotable/TableRowActions';
import {
  FormatUTCToPDT,
  formatPDTToUTC,
} from 'src/general/components/DateTime';
import { upsertDropMutation } from 'src/edge/gql/admin/upsertDropMutation';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadComponent } from 'src/general/components/Image/FileUploadComponent';
import { fetchCreatorId } from 'src/modules/users/fetchCreatorId';

export const dropDetailConfig: FieldConfig[] = [
  { label: 'Name', key: 'title', isEditable: false },
  { label: 'Description', key: 'description', isEditable: true },
  { label: 'ID', key: 'id', isEditable: false },
  {
    label: 'Creator',
    key: ['creator', 'pref_username'],
    isEditable: true,
    render: (v: string) => <Creator creator={v} />,
  },
  {
    label: 'Start Time',
    key: 'startTime',
    isEditable: true,
    render: (v: string, contentColor: string) => (
      <FormatUTCToPDT date={v} contentColor={contentColor} />
    ),
  },
  {
    label: 'End Time',
    key: 'endTime',
    isEditable: true,
    render: (v: string, contentColor: string) => (
      <FormatUTCToPDT date={v} contentColor={contentColor} />
    ),
  },
  {
    label: 'Status',
    key: 'status',
    isEditable: false,
    render: (v: string) => {
      return <Status status={v} />;
    },
  },
];

export const DropDetails = ({ dropId }: { dropId: string }) => {
  const [hoverRow, setHoverRow] = useState<number>(-1);
  const toast = useToast();

  const consumerClient = useConsumerClient();
  const {
    loading,
    data: rowData,
    error,
    refetch,
  } = useQuery(searchDropsQuery, {
    variables: {
      searchInput: {
        filters: {
          byID: [dropId],
          notIDs: [],
          byDropStatuses: [DropStatus.ALL],
        },
      },
    },
    client: consumerClient,
  });

  const data = rowData ? formatDropData(rowData?.searchDrops?.drops)[0] : null;

  if (error) {
    Logger.getInstance().error(
      `searchDropsWithEditionsQuery error: ${error.message}`,
      {
        errorMessage: error.message,
        dropId,
        source: 'DropDetails',
      },
    );
    toast({
      title: 'Error',
      description: `Search drop error: ${error.message}`,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
  }

  const adminClient = useAdminClient();
  const [upsertDrop] = useMutation(upsertDropMutation, {
    client: adminClient,
  });

  const updateDropDetailData = async (id, fieldKey, newValue) => {
    newValue =
      fieldKey === 'startTime' || fieldKey === 'endTime'
        ? formatPDTToUTC(newValue)
        : newValue;

    // Handler special case:  creator
    if (fieldKey?.includes('creator')) {
      const creatorId = await fetchCreatorId(consumerClient, newValue);
      if (!creatorId) {
        Logger.getInstance().error(
          'fetchCreatorId error: No Creator is Found',
          {
            errorMessage: 'No Creator is Found',
            prefUserName: newValue,
            source: 'DropDetails',
          },
        );
        throw new Error('No creator is found!');
      }
      fieldKey = 'creatorID';
      newValue = creatorId;
    }

    let payload = {
      variables: {
        input: {
          id: id,
          [fieldKey]: newValue,
          idempotencyKey: uuidv4(),
        },
      },
    };

    //@Mountz - if fieldKey = startTime, we also need to update the payload with endTime
    //this is a bug in backend, remove after ticket is resolved
    if (fieldKey === 'startTime') {
      payload.variables.input['endTime'] = data.endTime;
    }

    const { errors: upsertDropErrors } = await upsertDrop(payload);
    if (upsertDropErrors) {
      Logger.getInstance().error(
        `updateDropDetailData error: ${upsertDropErrors[0].message}`,
        {
          errorMessage: upsertDropErrors[0].message,
          id,
          source: 'DropDetails',
        },
      );
      toast({
        title: 'Error',
        description: `Update drop detail error: ${upsertDropErrors[0].message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } else {
      //refetch searchDrops query after updating data
      refetch();
    }
  };

  return (
    <React.Fragment>
      {!loading && data && (
        <Container centerContent>
          <FileUploadComponent {...data} />
        </Container>
      )}
      <Table>
        <Tbody>
          {loading || !data ? (
            <TableInitialLoadingSkeleton
              rowNum={dropDetailConfig.length}
              columnNum={3}
            />
          ) : (
            dropDetailConfig.map((fieldConfig, index: number) => {
              const showAction = fieldConfig.isEditable
                ? index === hoverRow
                : false;
              /*data.status === PlatformStatus.PUBLIC // Published Data should not be modified. //@Mountz TODO: remove comment when drop status is supported
                ? false
                : fieldConfig.isEditable
                ? index === hoverRow
                : false;*/
              const labelColor = fieldConfig.isEditable
                ? showAction
                  ? 'users.purple'
                  : 'gray.400'
                : 'gray.400';
              const contentColor = fieldConfig.isEditable
                ? showAction
                  ? 'users.purple'
                  : 'white'
                : 'gray.600';
              return (
                <Tr
                  key={index}
                  onMouseEnter={() => setHoverRow(index)}
                  onMouseLeave={() => setHoverRow(-1)}
                >
                  <Td maxW="2xs">
                    <Text
                      w="full"
                      textStyle="userDetailFont"
                      color={labelColor}
                    >
                      {fieldConfig.label}
                    </Text>
                  </Td>
                  <Td maxW="xs">
                    {fieldConfig.render ? (
                      fieldConfig.render(
                        getValueByConfig(data, fieldConfig),
                        contentColor,
                      )
                    ) : (
                      <Text
                        w="full"
                        textStyle="userDetailFont"
                        color={contentColor}
                      >
                        {getValueByConfig(data, fieldConfig)}
                      </Text>
                    )}
                  </Td>
                  <Td w="3xs" visibility={showAction ? 'visible' : 'hidden'}>
                    <TableRowActions
                      fieldConfig={fieldConfig}
                      data={data}
                      hiddenActionRow={() => {
                        setHoverRow(-1);
                      }}
                      updateData={updateDropDetailData}
                    />
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
    </React.Fragment>
  );
};
