import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Text, Checkbox, useToast } from 'src/theme';
import { ColumnDef } from '@tanstack/react-table';
import {
  UnlimitedDataTable,
  MoreActionMenu,
  DataName,
} from 'src/general/datatable';
import { Drop, formatDropData } from './DropTypes';
import { useQuery } from '@apollo/client';
import { useConsumerClient } from 'src/lib/apollo/MultiApolloProvider';
import { searchDropsQuery } from 'src/edge/gql/consumer/searchDropsQuery';
import {
  DropStatus,
  SearchDropsInput,
} from 'src/edge/__generated/types/consumer/globalTypes';
import { dropsDetail } from 'src/modules/routes';
import { Status } from 'src/general/components/Status';
import { DropReleaseTypeBadge } from './DropReleaseTypeBadge';
import { Creator } from 'src/general/components/Creator';
import Logger from 'shared/logger';

export const DROP_PAGE_SIZE = 20;

export const DropUnlimitedList = ({
  DropStatus,
  updateCount,
}: {
  DropStatus: DropStatus[];
  updateCount?: Dispatch<SetStateAction<Number>>;
}) => {
  const consumerClient = useConsumerClient();
  const columns = useMemo<ColumnDef<Drop>[]>(
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
        id: 'Drop',
        header: () => <Text fontSize="md">Drop</Text>,
        accessorKey: 'title',
        cell: (props) => (
          <DataName
            name={props.renderValue() as string}
            isSelected={props.row.getIsSelected()}
            url={dropsDetail(props.row.original.id)}
          />
        ),
      },
      {
        id: 'Start Time',
        header: () => <Text fontSize="md">Start Time</Text>,
        accessorKey: 'startTime',
        cell: (props) => {
          const date = props.row.original.startTime;
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          // @ts-ignore
          const formatedDate = new Intl.DateTimeFormat('en-US', options).format(
            new Date(date), // todo: check time zone
          );
          return (
            <Text color={props.row.getIsSelected() ? 'users.purple' : 'white'}>
              {formatedDate}
            </Text>
          );
        },
      },
      {
        id: 'End Time',
        header: () => <Text fontSize="md">End Time</Text>,
        accessorKey: 'endTime',
        cell: (props) => {
          const date = props.row.original.endTime;
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          // @ts-ignore
          const formatedDate = new Intl.DateTimeFormat('en-US', options).format(
            new Date(date), // todo: check time zone
          );
          return (
            <Text color={props.row.getIsSelected() ? 'users.purple' : 'white'}>
              {formatedDate}
            </Text>
          );
        },
      },
      {
        id: 'Creator',
        header: () => <Text fontSize="md">Creator</Text>,
        accessorKey: 'creator',
        cell: (props) => (
          <Creator
            creator={
              (props.renderValue() as any).pref_username ??
              (props.renderValue() as any).owner_sub_id //@mountz-if pref_username is not set, default to cognito ID
            }
          />
        ),
      },
      {
        id: 'Type',
        header: () => <Text fontSize="md">Type</Text>,
        accessorKey: 'type',
        cell: (props) => (
          <DropReleaseTypeBadge type={props.renderValue() as any} />
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
            .rows.map((e) => e.original) as Drop[];
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
  const [formatedData, setFormatedData] = useState<Drop[]>([]);
  const toast = useToast();
  const searchOption: SearchDropsInput = {
    filters: {
      byDropStatuses: DropStatus,
    },
    pageSize: DROP_PAGE_SIZE,
    cursor: null,
  };
  const { data, loading, refetch, error } = useQuery(searchDropsQuery, {
    variables: { searchInput: searchOption },
    client: consumerClient,
  });
  if (error) {
    toast({
      title: 'Graphql Error',
      description: `Search drop query error:  ${error?.message}`,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
    Logger.getInstance().error(`Search drop query error:  ${error?.message}`, {
      DropStatus,
      errorMessage: error,
      source: 'searchDropsQuery',
    });
  }

  useEffect(() => {
    if (data?.searchDrops?.pageInfo?.nextCursor) {
      setCursor(data?.searchDrops?.pageInfo?.nextCursor);
    } else {
      setCursor(null); // to disable the load more button
    }
    if (data?.searchDrops?.drops) {
      setFormatedData((prevData) => {
        return prevData.concat(formatDropData(data?.searchDrops?.drops));
      });
      if (updateCount) {
        updateCount((prev) => prev + data?.searchDrops?.drops?.length ?? 0);
      }
    }
  }, [data, updateCount]);

  const handleFetchMore = async () => {
    try {
      await refetch({ searchInput: { ...searchOption, cursor } });
    } catch (e) {
      toast({
        title: 'Graphql refecth Error',
        description: `Search drop query refecth error:  ${e?.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(
        `Search drop query refech error:  ${e?.message}`,
        {
          DropStatus,
          errorMessage: e?.message,
          source: 'searchDropsQuery refecth',
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
