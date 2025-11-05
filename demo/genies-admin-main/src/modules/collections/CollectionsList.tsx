import React, { useMemo } from 'react';
import { useMockData } from 'src/modules/collections/makeData';
import { Collection } from './CollectionType';
import { Text, Checkbox } from 'src/theme';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable, MoreActionMenu, DataName } from 'src/general/datatable';
import { Status } from 'src/general/components/Status';
import { Creator } from 'src/general/components/Creator';
import { collectionsDetail } from 'src/modules/routes';

export const CollectionsList = () => {
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
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 20,
    });
  const { loading, data } = useMockData(pageIndex, pageSize);
  const defaultData = useMemo<Collection[]>(() => [], []);
  const totalDataCount = useMemo(() => {
    return data ? data.count : 100;
  }, [data]);

  return (
    <DataTable
      countHeader="Collections"
      columns={columns}
      data={data ? data.collections : defaultData}
      pagination={{
        pageIndex,
        pageSize,
      }}
      setPagination={setPagination}
      loading={loading}
      totalDataCount={totalDataCount}
    />
  );
};
