import React from 'react';
import { Button } from 'src/theme';
import { HiOutlineDownload } from 'react-icons/hi';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { searchReservedUsernamesQuery } from 'src/edge/gql/admin/searchReservedUsernamesQuery';
import { SearchReservedUsernamesInput } from 'src/edge/__generated/types/admin/globalTypes';
import { searchReservedUsernames_searchReservedUsernames_reservedUsernames as ReservedUsername } from 'src/edge/__generated/types/admin/searchReservedUsernames';

export const ExportAllReserveUsernames = () => {
  const adminClient = useAdminClient();

  const fetchAllReserveNames = async () => {
    let allReserveNames: ReservedUsername[] = [];
    let searchOption: SearchReservedUsernamesInput = {
      filters: {
        byUsernames: [],
      },
      pageSize: 500,
      cursor: null,
    };
    let currentResult;
    let nextCursor = null;
    do {
      searchOption = { ...searchOption, cursor: nextCursor };
      currentResult = await adminClient.query({
        query: searchReservedUsernamesQuery,
        variables: { searchInput: searchOption },
        fetchPolicy: 'no-cache',
      });
      nextCursor =
        currentResult?.data?.searchReservedUsernames?.pageInfo?.nextCursor;
      const currentNames =
        currentResult?.data?.searchReservedUsernames?.reservedUsernames;
      allReserveNames.push(...currentNames);
    } while (nextCursor && nextCursor?.length > 10);
    return allReserveNames;
  };

  const downloadFile = ({
    data,
    fileName,
    fileType,
  }: {
    data: string;
    fileName: string;
    fileType: string;
  }) => {
    const blob = new Blob([data], { type: fileType });

    const a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  };

  const exportToCsv = (data: ReservedUsername[]) => {
    let headers = ['Reserved_Username,Phone_Number '];
    let usersCsv = data.reduce((res, user) => {
      const { username, phoneNumber } = user;
      res.push([username, phoneNumber].join(','));
      return res;
    }, []);

    downloadFile({
      data: [...headers, ...usersCsv].join('\n'),
      fileName: 'allReservedUserames.csv',
      fileType: 'text/csv',
    });
  };

  const handleDownload = async () => {
    const allNames = await fetchAllReserveNames();
    exportToCsv(allNames);
  };
  return (
    <Button
      size="lg"
      variant="ghost"
      color="users.purple"
      fontWeight={400}
      leftIcon={<HiOutlineDownload />}
      onClick={handleDownload}
    >
      Export All Names
    </Button>
  );
};
