import React, { Fragment } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  Button,
  Box,
} from 'src/theme';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { TableInitialLoadingSkeleton } from './TableInitialLoadingSkeleton';
import { DropEdition } from 'src/modules/drops/detail/DropEditionListing';
import { Edition } from 'src/modules/Edition';

export function SimpleDataTable({
  columns,
  data,
  loading,
  removeEditions,
}: {
  columns: ColumnDef<DropEdition | Edition>[];
  data: DropEdition[] | Edition[];
  loading: boolean;
  removeEditions?: (table) => void;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <Fragment>
      <Box display="flex">
        {!!removeEditions && (
          <Button
            ml="auto"
            onClick={() => removeEditions(table)}
            isDisabled={table.getSelectedRowModel().rows.length === 0}
          >
            Remove
          </Button>
        )}
      </Box>
      <Table>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => {
            return (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th key={header.id} colSpan={header.colSpan}>
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
              rowNum={5}
              columnNum={table.getAllColumns().length}
            />
          ) : (
            table.getRowModel().rows.map((row) => {
              return (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell, idx) => {
                    const isToggleColumn =
                      idx === 0 && cell.column.id === 'Select';
                    const addToggleSelectionHander = isToggleColumn
                      ? {}
                      : { onClick: row.getToggleSelectedHandler() };
                    return (
                      <Td
                        key={cell.id}
                        pl={6}
                        px={1}
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
    </Fragment>
  );
}
