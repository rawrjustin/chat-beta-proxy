import React, { Fragment, useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Skeleton, Button } from 'src/theme';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  RowData,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import { TableInitialLoadingSkeleton } from './TableInitialLoadingSkeleton';
import { useGetFeatureFlags, AdminFeatureFlags } from 'src/lib/statsig';

export function UnlimitedDataTable<TData extends RowData>({
  columns,
  data,
  loading,
  handleFetchMore,
  cursor,
}: {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading: boolean;
  handleFetchMore: () => void;
  cursor: string;
}) {
  const enableTableRowSelection = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_TABLE_ROW_SELECTION,
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [fetchMoreLoading, setFetchMoreLoading] = useState(false);
  const tableRowSelectionConfig = enableTableRowSelection
    ? { onRowSelectionChange: setRowSelection }
    : {};
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    ...tableRowSelectionConfig,
  });

  const handleFetchMoreWithState = async () => {
    setFetchMoreLoading(true);
    await handleFetchMore();
    setFetchMoreLoading(false);
  };

  return (
    <Fragment>
      <Table>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => {
            return (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const showFixedWithColumns =
                    header.id === 'Select' || header.id === 'Menu';
                  const fixWidthProps = showFixedWithColumns ? { w: 6 } : {};
                  return (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      {...fixWidthProps}
                    >
                      {flexRender(
                        header.column.columnDef.header as string,
                        header.getContext(),
                      )}
                    </Th>
                  );
                })}
              </Tr>
            );
          })}
        </Thead>
        <Tbody>
          {loading ? (
            <TableInitialLoadingSkeleton
              rowNum={15}
              columnNum={table.getAllColumns().length}
            />
          ) : (
            table.getRowModel().rows.map((row) => {
              return (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell, idx) => {
                    const isMenuColumn =
                      idx === table.getAllColumns().length - 1;
                    const addToggleSelectionHander = enableTableRowSelection
                      ? isMenuColumn
                        ? {}
                        : { onClick: row.getToggleSelectedHandler() }
                      : {};
                    return (
                      <Td
                        key={cell.id}
                        px={1}
                        pl={isMenuColumn ? 0 : 6}
                        {...addToggleSelectionHander}
                      >
                        <Skeleton isLoaded={!loading}>
                          {flexRender(
                            cell.column.columnDef.cell as string,
                            cell.getContext(),
                          )}
                        </Skeleton>
                      </Td>
                    );
                  })}
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
      <Button
        w="full"
        mt={6}
        mb={20}
        onClick={handleFetchMoreWithState}
        isLoading={fetchMoreLoading}
        isDisabled={!cursor}
      >
        Load More
      </Button>
    </Fragment>
  );
}
