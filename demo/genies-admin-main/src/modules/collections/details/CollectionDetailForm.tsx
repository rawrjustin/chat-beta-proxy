import React, { ReactElement, useState } from 'react';
import { formatCollectionData } from '../CollectionType';
import { Table, Tbody, Tr, Td, Text } from 'src/theme';
import { Status } from 'src/general/components/Status';
import { FormAction } from './FormAction';
import { TableInitialLoadingSkeleton } from 'src/general/datatable/TableInitialLoadingSkeleton';
import { ApolloQueryResult, useMutation, useQuery } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { searchCollectionsQuery } from 'src/edge/gql/admin/searchCollectionsQuery';
import { updateCollectionMutation } from 'src/edge/gql/admin/updateCollectionMutation';
import { v4 as uuidv4 } from 'uuid';
import Logger from 'shared/logger';

export interface FieldConfig {
  label: string;
  key: string | string[];
  isEditable?: boolean;
  isOnchain?: boolean;
  render?: (v?: any, contentColor?: string) => ReactElement;
}

export const collectionFormConfig: FieldConfig[] = [
  { label: 'Name', key: 'name', isEditable: false, isOnchain: true },
  {
    label: 'Description',
    key: ['metadata', 'description'],
    isEditable: true,
    isOnchain: false,
  },
  {
    label: 'Serie',
    key: ['serie', 'name'],
    isEditable: false,
    isOnchain: true,
  },
  { label: 'Flow ID', key: 'flowID', isEditable: false, isOnchain: true },
  {
    label: 'Created On',
    key: 'createdOn',
    isEditable: false,
    isOnchain: false,
  },
  {
    label: 'Status',
    key: 'status',
    isEditable: false,
    isOnchain: false,
    render: (v: string) => {
      return <Status status={v} />;
    },
  },
  {
    label: 'Phone Number',
    key: 'phoneNumber',
    isEditable: true,
    isOnchain: false,
  },
];

export const getValueByConfig = (data, config: FieldConfig) => {
  if (Array.isArray(config.key)) {
    return config.key.reduce((prev, k) => {
      if (prev) return prev[k];
      else return prev;
    }, data);
  } else {
    return data[config.key];
  }
};

export const CollectionsDetailForm = ({
  flowId,
  refetch,
}: {
  flowId: string;
  refetch(): Promise<ApolloQueryResult<any>>;
}) => {
  const adminClient = useAdminClient();
  const { loading, data: rowData } = useQuery(searchCollectionsQuery, {
    variables: {
      searchInput: {
        filters: {
          byFlowIDs: [flowId],
          byCreatorIDs: [],
        },
        pageSize: 1,
      },
    },
    client: adminClient,
    skip: !flowId,
  });
  const [hoverRow, setHoverRow] = useState<number>(-1);

  const data = rowData
    ? formatCollectionData(rowData.searchCollections.collections)[0]
    : null;

  const [updateCollection] = useMutation(updateCollectionMutation, {
    client: adminClient,
  });

  const reduceArrayToObject = (arr, newValue) => {
    const obj = {};
    arr.reduce((o, s) => {
      return s === arr[arr.length - 1] ? (o[s] = newValue) : (o[s] = {});
    }, obj);
    return obj;
  };

  const updateCollectionDetailData = async (id, fieldKey, newValue) => {
    //If fieldKey is array, map an object to match format for gql
    let updatedObject = Array.isArray(fieldKey)
      ? reduceArrayToObject(fieldKey, newValue)
      : { [fieldKey]: newValue };
    let payload = {
      variables: {
        input: {
          id: id,
          ...updatedObject,
          idempotencyKey: uuidv4(),
        },
      },
    };

    const { errors: updateCollectionError } = await updateCollection(payload);
    if (updateCollectionError) {
      Logger.getInstance().error(
        `updateCollection error: ${updateCollectionError[0].message}`,
        {
          errorMessage: updateCollectionError,
          source: 'CollectionDetailForm',
        },
      );
      //Throw error message for toast
      throw new Error(updateCollectionError[0].message);
    } else {
      //refetch searchCollections query after updating data
      refetch();
    }
  };

  return (
    <Table>
      <Tbody>
        {loading || !data ? (
          <TableInitialLoadingSkeleton
            rowNum={collectionFormConfig.length}
            columnNum={3}
          />
        ) : (
          collectionFormConfig.map((fieldConfig, index: number) => {
            const showAction = fieldConfig.isEditable
              ? index === hoverRow
              : false;
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
                  <Text w="full" textStyle="userDetailFont" color={labelColor}>
                    {fieldConfig.label}
                    {fieldConfig.isOnchain && <sup>Onchain</sup>}
                  </Text>
                </Td>
                <Td maxW="xs">
                  {fieldConfig.render ? (
                    fieldConfig.render(getValueByConfig(data, fieldConfig))
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
                  <FormAction
                    data={data}
                    fieldConfig={fieldConfig}
                    hiddenActionRow={() => {
                      setHoverRow(-1);
                    }}
                    updateData={updateCollectionDetailData}
                  />
                </Td>
              </Tr>
            );
          })
        )}
      </Tbody>
    </Table>
  );
};
