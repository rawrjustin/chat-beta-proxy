import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { UnlimitedDataTable } from 'src/general/datatable';
import { Text } from 'src/theme';
import {
  BuildStatusTag,
  getStatusTagByConfig,
  StatusTagConfig,
} from 'src/general/components/BuildStatusTag';
import { ThingBuildActions } from './ThingBuildActions';
import { ThingVersionStatus } from './types';

const BuildStatusTagConfig: Array<StatusTagConfig> = [
  {
    bg: '#E3F9E9',
    color: '#2BA471',
    label: 'Approved',
    accessKey: ThingVersionStatus.APPROVED,
  },
  {
    bg: '#A3A2A2',
    color: 'white',
    label: 'Cancelled',
    accessKey: ThingVersionStatus.CANCELLED,
  },
  {
    bg: '#C8BFFE',
    color: '#6F57FF',
    label: 'Published',
    accessKey: ThingVersionStatus.PUBLISHED,
  },
  {
    bg: '#FFE4DE',
    color: '#D54941',
    label: 'Rejected',
    accessKey: ThingVersionStatus.REJECTED,
  },
  {
    bg: '#DCB0FF',
    color: '#B557FF',
    label: 'Under Review',
    accessKey: ThingVersionStatus.UNDERREVIEW,
  },
];

export type ThingBuildsProps = {
  thingVersionId: string;
  status: string;
  reviewerId: string;
  reviewerComment: string;
  version: string;
};

export const ThingBuildsUnlimitedList = ({
  loading,
  thingId,
  thingBuilds,
}: {
  loading: boolean;
  thingId: string;
  thingBuilds: Array<ThingBuildsProps>;
}) => {
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'Version',
        header: () => <Text fontSize="md">Version</Text>,
        accessorKey: 'version',
        cell: (props) => <Text>{props.renderValue() as string}</Text>,
      },
      {
        id: 'Id',
        header: () => <Text fontSize="md">Id</Text>,
        accessorKey: 'thingVersionId',
        cell: (props) => <Text>{props.renderValue() as string}</Text>,
      },
      {
        id: 'Status',
        header: () => <Text fontSize="md">Status</Text>,
        accessorKey: 'status',
        cell: (props) => (
          <BuildStatusTag
            config={getStatusTagByConfig(
              props.renderValue() as string,
              BuildStatusTagConfig,
            )}
          />
        ),
      },
      {
        id: 'reviewerId',
        header: () => <Text fontSize="md">Reviewer ID</Text>,
        accessorKey: 'reviewerId',
        cell: (props) => <Text>{props.renderValue() as string}</Text>,
      },
      {
        id: 'reviewerComment',
        header: () => <Text fontSize="md">Reviewer Comment</Text>,
        accessorKey: 'reviewerComment',
        cell: (props) => <Text>{props.renderValue() as string}</Text>,
      },
      {
        id: 'Actions',
        header: () => <Text fontSize="md">Actions</Text>,
        cell: ({ row }) => {
          const currentBuild = thingBuilds[row.index];
          return (
            <ThingBuildActions
              thingId={thingId}
              thingVersionId={currentBuild.thingVersionId}
              status={currentBuild.status}
            />
          );
        },
      },
    ],
    [thingBuilds, thingId],
  );
  return (
    <UnlimitedDataTable
      columns={columns}
      data={thingBuilds}
      loading={loading}
      cursor={null}
      handleFetchMore={null}
    />
  );
};
