import React, { useEffect, useMemo, useState } from 'react';
import { Text, Checkbox, useToast } from 'src/theme';
import { ColumnDef } from '@tanstack/react-table';
import {
  UnlimitedDataTable,
  MoreActionMenu,
  DataName,
} from 'src/general/datatable';
import { Status } from 'src/general/components/Status';
import { Creator } from 'src/general/components/Creator';
import { useQuery } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { searchCollectionsQuery } from 'src/edge/gql/admin/searchCollectionsQuery';
import { Collection, formatCollectionData } from './CollectionType';
import { collectionsDetail } from 'src/modules/routes';
import { AdminSearchCollectionsInput } from 'src/edge/__generated/types/admin/globalTypes';
import Logger from 'shared/logger';

const PAGESIZE = 20;

export const CollectionsUnlimitedList = () => {
  const adminClient = useAdminClient();
  const columns = useMemo<ColumnDef<Collection>[]>(
    () => [
      {
        id: 'Select',
        header: () => '',
        cell: ({ row }) => {
          return (
            <Checkbox
              display={row.getIsSelected() ? 'inline' : 'none'}
              isChecked
              onChange={row.getToggleSelectedHandler()}
            />
          );
        },
      },
      {
        id: 'Collections',
        header: () => <Text fontSize="md">Collections</Text>,
        accessorKey: 'name',
        cell: (props) => (
          <DataName
            name={props.renderValue() as string}
            isSelected={props.row.getIsSelected()}
            url={collectionsDetail(props.row.original.id.toString())}
          />
        ),
      },
      {
        id: 'Creator',
        header: () => <Text fontSize="md">Creator</Text>,
        accessorKey: 'creator',
        cell: (props) => (
          <Creator
            creator={props.renderValue() as string}
            isSelected={props.row.getIsSelected()}
          />
        ),
      },
      {
        id: 'Created On',
        header: () => <Text fontSize="md">Created On</Text>,
        accessorKey: 'createdOn',
        cell: (props) => (
          <Text color={props.row.getIsSelected() ? 'users.purple' : 'white'}>
            {props.renderValue() as string}
          </Text>
        ),
      },
      {
        id: 'Status',
        header: () => <Text fontSize="md">Status</Text>,
        accessorKey: 'status',
        cell: (props) => <Status status={props.renderValue() as string} />,
      },
      {
        id: 'Menu',
        header: () => '',
        cell: ({ row, table }) => {
          const selectRowData = table
            .getSelectedRowModel()
            .rows.map((e) => e.original) as Collection[];
          return (
            row.getIsSelected() && (
              <MoreActionMenu selectedData={selectRowData} />
            )
          );
        },
      },
    ],
    [],
  );
  const [cursor, setCursor] = useState<string>('');
  const [formatedData, setFormatedData] = useState<Collection[]>([]);
  const toast = useToast();
  const searchOption: AdminSearchCollectionsInput = {
    filters: {
      byFlowIDs: [],
      byCreatorIDs: [],
    },
    pageSize: PAGESIZE,
    cursor: null,
  };
  const { data, loading, refetch, error } = useQuery(searchCollectionsQuery, {
    variables: { searchInput: searchOption },
    client: adminClient,
  });
  if (error) {
    toast({
      title: 'Graphql Error',
      description: `Search collection query error:  ${error?.message}`,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
    Logger.getInstance().error(
      `Search collection query error:  ${error?.message}`,
      {
        errorMessage: error,
        source: 'searchCollectionsQuery',
      },
    );
  }
  useEffect(() => {
    if (data?.searchCollections?.pageInfo?.nextCursor) {
      setCursor(data?.searchCollections?.pageInfo?.nextCursor);
    } else {
      setCursor(null); // to disable the load more button
    }
    if (data) {
      setFormatedData((prevData) => {
        return prevData.concat(
          formatCollectionData(data.searchCollections.collections),
        );
      });
    }
  }, [data]);

  const handleFetchMore = async () => {
    try {
      await refetch({ searchInput: { ...searchOption, cursor } });
    } catch (e) {
      toast({
        title: 'Graphql refecth Error',
        description: `Search collection query refecth error:  ${e?.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(
        `Search collection query refecth error:  ${e?.message}`,
        {
          errorMessage: e?.message,
          source: 'searchCollectionsQuery refetch',
        },
      );
    }
  };

  return (
    <UnlimitedDataTable
      columns={columns}
      data={formatedData}
      loading={loading}
      handleFetchMore={handleFetchMore}
      cursor={cursor}
    />
  );
};
