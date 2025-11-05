import React from 'react';
import { Text, Flex, Box } from 'src/theme';

const PaginationButton = ({
  content,
  disabled,
  handleSetPageIndex,
}: {
  content: string;
  disabled: boolean;
  handleSetPageIndex: () => void;
}) => {
  return (
    <Box as="button" onClick={handleSetPageIndex} disabled={disabled} px={2}>
      <Text fontWeight="semibold" fontSize="md" color="gray">
        {content}
      </Text>
    </Box>
  );
};

export const TablePaginationFooter = ({
  pageIndex,
  pageSize,
  totalCount,
  handleSetPageIndex,
}: {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  handleSetPageIndex: (idx: number) => void;
}) => {
  const lastIdx = Math.ceil(totalCount / pageSize);
  const currentIdx = pageIndex + 1;
  const shouldShowFirstPage = !(currentIdx === 1 || currentIdx - 1 === 1);
  const shouldShowPreviousDot = currentIdx - 2 > 1;
  const shouldShowPreviousPage = currentIdx - 1 >= 1;
  const shouldShowNextPage = currentIdx + 1 <= lastIdx;
  const shouldShowNextDot = currentIdx + 2 < lastIdx;
  const shouldShowLastPage = !(
    currentIdx === lastIdx || currentIdx + 1 === lastIdx
  );
  return (
    <Flex my={10}>
      <PaginationButton
        content="<"
        disabled={currentIdx - 1 < 1}
        handleSetPageIndex={() => handleSetPageIndex(pageIndex - 1)}
      />
      {shouldShowFirstPage && (
        <PaginationButton
          content="1"
          disabled={false}
          handleSetPageIndex={() => handleSetPageIndex(1)}
        />
      )}
      {shouldShowPreviousDot && (
        <Text px={2} fontWeight="semibold" fontSize="md" color="gray">
          ...
        </Text>
      )}
      {shouldShowPreviousPage && (
        <PaginationButton
          content={(currentIdx - 1).toString()}
          disabled={false}
          handleSetPageIndex={() => handleSetPageIndex(pageIndex - 1)}
        />
      )}
      <Text px={2} bg="gray" fontWeight="semibold" fontSize="md" color="white">
        {currentIdx}
      </Text>
      {shouldShowNextPage && (
        <PaginationButton
          content={(currentIdx + 1).toString()}
          disabled={false}
          handleSetPageIndex={() => handleSetPageIndex(pageIndex + 1)}
        />
      )}
      {shouldShowNextDot && (
        <Text px={2} fontWeight="semibold" fontSize="md" color="gray">
          ...
        </Text>
      )}
      {shouldShowLastPage && (
        <PaginationButton
          content={lastIdx.toString()}
          disabled={false}
          handleSetPageIndex={() => handleSetPageIndex(lastIdx - 1)}
        />
      )}
      <PaginationButton
        content=">"
        disabled={currentIdx + 1 > lastIdx}
        handleSetPageIndex={() => handleSetPageIndex(pageIndex + 1)}
      />
    </Flex>
  );
};
