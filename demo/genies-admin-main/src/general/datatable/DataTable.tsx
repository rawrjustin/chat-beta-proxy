import React, { Dispatch, Fragment, SetStateAction } from 'react';
import { Collection } from 'src/modules/collections';
import { Table, Thead, Tbody, Tr, Th, Td, Skeleton } from 'src/theme';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import { TableInfoHeader } from './TableInfoHeader';
import { TablePaginationFooter } from './TablePaginationFooter';
import { TableInitialLoadingSkeleton } from './TableInitialLoadingSkeleton';

export function DataTable({
  countHeader,
  columns,
  data,
  pagination,
  loading,
  totalDataCount,
  setPagination,
}: {
  countHeader: string;
  columns: ColumnDef<Collection>[];
  data: Collection[];
  pagination: PaginationState;
  loading: boolean;
  totalDataCount: number;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
}) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const table = useReactTable({
    data,
    columns,
    pageCount: totalDataCount,
    state: {
      pagination,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    // enableRowSelection: true,
    // enableMultiRowSelection: true,
    // debugTable: true,
  });

  const { pageIndex, pageSize } = pagination;

  const handleSetTableSize = (len: number) => {
    table.resetRowSelection();
    table.setPageSize(len);
  };

  const handleSetPageIndex = (idx: number) => {
    table.resetRowSelection();
    table.setPageIndex(idx);
  };

  return (
    <Fragment>
      <TableInfoHeader
        header={countHeader}
        count={totalDataCount}
        loading={loading}
        currentPageSize={pageSize}
        handleSetTableSize={handleSetTableSize}
      />
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
          {data.length === 0 ? (
            <TableInitialLoadingSkeleton
              rowNum={15}
              columnNum={table.getAllColumns().length}
            />
          ) : (
            table.getRowModel().rows.map((row) => {
              return (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell, idx) => {
                    const addToggleSelectionHander =
                      idx === table.getAllColumns().length - 1
                        ? {}
                        : { onClick: row.getToggleSelectedHandler() };
                    return (
                      <Td key={cell.id} px={1} {...addToggleSelectionHander}>
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
      <TablePaginationFooter
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalCount={totalDataCount}
        handleSetPageIndex={handleSetPageIndex}
      />
    </Fragment>
  );
}
