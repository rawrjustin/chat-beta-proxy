import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { UnlimitedDataTable } from 'src/general/datatable';
import { Text, Checkbox, Image, Center, Link } from 'src/theme';
import { categoryOptions } from './constants';
import { Jacket } from './3DCreationIcons';
import { gearDetail } from '../routes/routes';
import { useAccessToken } from 'src/lib/swagger/devkit/util';
import getGearListAdmin from 'src/edge/shim/getGearListAdmin';

const GEAR_LIMIT = 20;

export const GearsUnlimitedList = () => {
  const [gears, setGears] = useState<any[]>([]);
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

  const fetchGears = async () => {
    if (!accessToken) return;
    const res = await getGearListAdmin(cursor, GEAR_LIMIT);

    if (res?.gears) {
      setGears((prev) => prev.concat(res.gears));
    }
    if (res?.cursor !== cursor) {
      setCursor(res?.cursor);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    if (!accessToken) return;
    fetchGears();
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
            const category = props.row.original?.category;
            const categoryListIcon = categoryOptions.find(
              (option) => option.category === category,
            )?.listIcon;
            return (
              <Center
                borderRadius="md"
                w="60px"
                h="60px"
                bgGradient="radial-gradient(circle, #FFFFFF, #A9A9A9)"
              >
                {categoryListIcon ?? (
                  <Jacket color="black" w="32px" h="32px" margin="auto" />
                )}
              </Center>
            );
          }
        },
      },
      {
        id: 'Gears',
        header: () => <Text fontSize="md">Item Name</Text>,
        accessorKey: 'name',
        cell: (props) => {
          return (
            <Link
              color={props.row.getIsSelected() ? 'users.purple' : 'white'}
              href={gearDetail(props.row.original.id)}
            >
              {props.renderValue() as string}
            </Link>
          );
        },
      },
      {
        id: 'SubmittedOn',
        header: () => <Text fontSize="md">Submitted On</Text>,
        accessorKey: 'createdAt',
        cell: (props) => (
          <Text color={props.row.getIsSelected() ? 'users.purple' : 'white'}>
            {formatDate(props.renderValue() as number)}
          </Text>
        ),
      },
      {
        id: 'Category',
        header: () => <Text fontSize="md">Type</Text>,
        accessorKey: 'category',
        cell: (props) => (
          <Text color={props.row.getIsSelected() ? 'users.purple' : 'white'}>
            {props.renderValue() as string}
          </Text>
        ),
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
        accessorKey: 'id',
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
        cell: (props) => {
          const status = props.renderValue() as string;
          let color = '#FFE142';
          let statusText = 'AWAITING REVIEW';

          if (status === 'APPROVED') {
            color = '#4ADF97';
            statusText = 'APPROVED';
          } else if (status === 'REJECTED') {
            color = '#F87171';
            statusText = 'REJECTED';
          } else if (status === 'FLAG') {
            color = '#9D85FF';
            statusText = 'FLAGGED';
          }
          return <Text color={color}>{statusText}</Text>;
        },
      },
    ],
    [],
  );

  return (
    <UnlimitedDataTable
      columns={columns}
      data={gears}
      loading={loading}
      handleFetchMore={fetchGears}
      cursor={cursor}
    />
  );
};

export default GearsUnlimitedList;
