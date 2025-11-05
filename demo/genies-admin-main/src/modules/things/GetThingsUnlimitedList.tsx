import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { UnlimitedDataTable } from 'src/general/datatable';
import { Text, Checkbox, Image, Center, Link } from 'src/theme';
import { Jacket } from 'src/modules/gears/3DCreationIcons';
import { thingDetail } from '../routes/routes';
import { useAccessToken } from 'src/lib/swagger/devkit/util';
import getThingsAdmin from 'src/edge/shim/getThingsAdmin';

const THING_LIMIT = 20;

export const GetThingsUnlimitedList = () => {
  const [things, setThings] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const accessToken = useAccessToken();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  const fetchThings = async () => {
    if (!accessToken) return;
    const res = await getThingsAdmin(cursor, THING_LIMIT);
    if (res?.things) {
      setThings((prev) => prev.concat(res.things));
    }
    if (res?.cursor !== cursor) {
      setCursor(res?.cursor);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    if (!accessToken) return;
    fetchThings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const columns = useMemo<ColumnDef<any>[]>(
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
        id: 'icon',
        header: () => <Text fontSize="md" />,
        accessorKey: 'iconUrl',
        cell: (props) => {
          const iconUrl = props.row.original?.iconUrl?.[0];
          if (iconUrl) {
            return (
              <Image alt="tableIcon" src={iconUrl} w="60px" borderRadius="md" />
            );
          } else {
            return (
              <Center
                borderRadius="md"
                w="60px"
                h="60px"
                bgGradient="radial-gradient(circle, #FFFFFF, #A9A9A9)"
              >
                <Jacket color="black" w="32px" h="32px" margin="auto" />
              </Center>
            );
          }
        },
      },
      {
        id: 'Things',
        header: () => <Text fontSize="md">Item Name</Text>,
        accessorKey: 'name',
        cell: ({ row }) => {
          const currentBuild = things[row.index].latestThingVersion;
          return (
            <Link
              color={row.getIsSelected() ? 'users.purple' : 'white'}
              href={thingDetail(
                things[row.index].thingId,
                things[row.index].creatorId,
              )}
            >
              {currentBuild.name}
            </Link>
          );
        },
      },
      {
        id: 'SubmittedOn',
        header: () => <Text fontSize="md">Submitted On</Text>,
        accessorKey: 'createAt',
        cell: ({ row }) => {
          const currentBuild = things[row.index].latestThingVersion;
          return (
            <Text color={row.getIsSelected() ? 'users.purple' : 'white'}>
              {formatDate(currentBuild.createAt)}
            </Text>
          );
        },
      },
      {
        id: 'CreatorId',
        header: () => <Text fontSize="md">Creator ID</Text>,
        accessorKey: 'creatorId',
        cell: (props) => {
          return (
            <Text color={props.row.getIsSelected() ? 'users.purple' : 'white'}>
              {props.renderValue() as string}
            </Text>
          );
        },
      },
      {
        id: 'Id',
        header: () => <Text fontSize="md">ID</Text>,
        accessorKey: 'thingId',
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
        cell: ({ row }) => {
          const currentBuild = things[row.index].latestThingVersion;
          const status = currentBuild.status;
          let color = '#FFE142';
          let statusText = 'AWAITING REVIEW';

          if (status === 'PUBLISHED') {
            color = '#4ADF97';
            statusText = 'APPROVED';
          } else if (status === 'REJECTED') {
            color = '#F87171';
            statusText = 'REJECTED';
          }
          return <Text color={color}>{statusText}</Text>;
        },
      },
    ],
    [things],
  );

  return (
    <UnlimitedDataTable
      columns={columns}
      data={things}
      loading={loading}
      handleFetchMore={fetchThings}
      cursor={cursor}
    />
  );
};
