import React, { Fragment } from 'react';
import { Tr, Td, Skeleton } from 'src/theme';

export const TableInitialLoadingSkeleton = ({
  rowNum,
  columnNum,
}: {
  rowNum: number;
  columnNum: number;
}) => {
  return (
    <Fragment>
      {[...Array(rowNum)].map((e, i) => {
        return (
          <Tr key={i}>
            {[...Array(columnNum)].map((e, j) => {
              return (
                <Td key={j}>
                  <Skeleton w="full" height={12} isLoaded={false} />
                </Td>
              );
            })}
          </Tr>
        );
      })}
    </Fragment>
  );
};
