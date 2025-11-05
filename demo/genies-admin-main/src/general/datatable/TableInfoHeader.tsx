import React, { Fragment } from 'react';
import { Text, Flex, Box, Skeleton } from 'src/theme';
import {} from '@tanstack/react-table';

const generateCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  } else {
    const thousand = Math.floor(count / 1000);
    const rest = Math.floor((count % 1000) / 100);
    return `${thousand}.${rest}K`;
  }
};

const getPagesizeDisplayInfo = (
  val: number,
  currentPageSize: number,
  handler: (len: number) => void,
) => {
  return val === currentPageSize ? (
    <Text as="u" px={1}>
      {val}
    </Text>
  ) : (
    <Box
      px={1}
      as="button"
      onClick={() => {
        handler(val);
      }}
    >
      <Text color="users.purple">{val}</Text>
    </Box>
  );
};
export const TableInfoHeader = ({
  header,
  count,
  loading,
  currentPageSize,
  handleSetTableSize,
}: {
  header: string;
  count: number;
  loading: boolean;
  currentPageSize: number;
  handleSetTableSize: (len: number) => void;
}) => {
  const displayCount = generateCount(count);
  return (
    <Fragment>
      <Flex justify="space-between" align="center" py={4} px={2}>
        <Flex align="center">
          <Skeleton isLoaded={!loading}>
            <Text textStyle="h4"> {displayCount} </Text>
          </Skeleton>
          <Text textStyle="h4" ml={4}>
            {header}
          </Text>
        </Flex>
        <Flex>
          <Text px={1}>Views:</Text>
          {getPagesizeDisplayInfo(20, currentPageSize, handleSetTableSize)}
          {getPagesizeDisplayInfo(40, currentPageSize, handleSetTableSize)}
        </Flex>
      </Flex>
    </Fragment>
  );
};
