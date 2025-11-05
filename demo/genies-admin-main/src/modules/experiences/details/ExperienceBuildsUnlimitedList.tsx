import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Text, useToast } from 'src/theme';
import { searchExperienceBuild_searchExperienceBuilds_builds_build as Build } from 'src/edge/__generated/types/consumer/searchExperienceBuild';
import { UnlimitedDataTable } from 'src/general/datatable';
import {
  CursorDirection,
  ExperienceBuildStatus,
  SearchExperienceBuildsInput,
} from 'src/edge/__generated/types/consumer/globalTypes';
import { useQuery } from '@apollo/client';
import { searchExperienceBuildsQuery } from 'src/edge/gql/consumer/searchExperienceBuildsQuery';
import { useConsumerClient } from 'src/lib/apollo/MultiApolloProvider';
import Logger from 'shared/logger';
import { ExperienceBuildActions } from './ExperienceBuildActions';
import { FormatUTCToPDT } from 'src/general/components/DateTime';
import {
  BuildStatusTag,
  getStatusTagByConfig,
  StatusTagConfig,
} from 'src/general/components/BuildStatusTag';
import {
  MdCancel,
  MdCheckCircle,
  MdPendingActions,
  MdUpload,
  MdDelete,
} from 'react-icons/md';
export interface BuildProps extends Build {
  appClientId: string;
}

const BuildStatusTagConfig: Array<StatusTagConfig> = [
  {
    bg: 'green.300',
    icon: MdCheckCircle,
    label: 'Approved',
    accessKey: ExperienceBuildStatus.APPROVED,
  },
  {
    bg: 'gray.300',
    icon: MdDelete,
    label: 'Cancelled',
    accessKey: ExperienceBuildStatus.CANCELLED,
  },
  {
    bg: 'blue.300',
    icon: MdUpload,
    label: 'Published',
    accessKey: ExperienceBuildStatus.PUBLISHED,
  },
  {
    bg: 'red.300',
    icon: MdCancel,
    label: 'Rejected',
    accessKey: ExperienceBuildStatus.REJECTED,
  },
  {
    bg: 'orange.300',
    icon: MdPendingActions,
    label: 'Under Review',
    accessKey: ExperienceBuildStatus.UNDERREVIEW,
  },
];

export const ExperienceBuildsUnlimitedList = ({
  experienceId,
}: {
  experienceId: string;
}) => {
  const consumerClient = useConsumerClient();
  const [buildsList, setBuildsList] = useState<BuildProps[]>([]);
  const toast = useToast();
  const searchInput: SearchExperienceBuildsInput = {
    base: {
      pagination: { cursor: '', limit: 20, direction: CursorDirection.RIGHT },
    },
    filters: {
      byExperienceID: experienceId,
      byBuildStatus: ExperienceBuildStatus.ALL,
    },
  };

  const { data, loading, refetch, error } = useQuery(
    searchExperienceBuildsQuery,
    {
      skip: !experienceId?.length,
      client: consumerClient,
      variables: {
        input: searchInput,
      },
    },
  );

  if (error) {
    Logger.getInstance().error(
      `Search experience builds query error:  ${error?.message}`,
      {
        errorMessage: error,
        source: 'searchExperienceBuildsQuery',
      },
    );
  }

  useEffect(() => {
    if (data?.searchExperienceBuilds?.builds) {
      const builds = data.searchExperienceBuilds.builds;
      setBuildsList(
        builds
          .map((item) => {
            return {
              ...item.build,
              appClientId: item.experience.appClientId,
            };
          })
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      );
    }
  }, [data]);

  const columns = useMemo<ColumnDef<Build>[]>(
    () => [
      {
        id: 'Id',
        header: () => <Text fontSize="md">Id</Text>,
        accessorKey: 'id',
        cell: (props) => <Text>{props.renderValue() as string}</Text>,
      },
      {
        id: 'createdAt',
        header: () => <Text fontSize="md">Created At</Text>,
        accessorKey: 'createdAt',
        cell: (props) => (
          <FormatUTCToPDT
            date={props.renderValue() as string}
            contentColor="grey.600"
          />
        ),
      },
      {
        id: 'updatedAt',
        header: () => <Text fontSize="md">Updated At</Text>,
        accessorKey: 'updatedAt',
        cell: (props) => (
          <FormatUTCToPDT
            date={props.renderValue() as string}
            contentColor="grey.600"
          />
        ),
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
        id: 'Actions',
        header: () => <Text fontSize="md">Actions</Text>,
        cell: ({ row }) => {
          const currentBuild = buildsList[row.index];
          const updateBuildsList = async () => {
            try {
              await refetch({
                input: {
                  base: {
                    pagination: {
                      cursor: '',
                      limit: 20,
                      direction: CursorDirection.RIGHT,
                    },
                  },
                  filters: {
                    byExperienceID: experienceId,
                    byBuildStatus: ExperienceBuildStatus.ALL,
                  },
                },
              });
            } catch (e) {
              toast({
                title: 'Graphql refecth Error',
                description: `Search experience builds refetch error:  ${error?.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top',
              });
              Logger.getInstance().error(
                `Search experience builds refetch error:  ${error?.message}`,
                {
                  errorMessage: error,
                  source: 'searchExperienceBuildsQuery',
                },
              );
            }
          };
          return (
            <ExperienceBuildActions
              build={currentBuild}
              updateBuildsList={updateBuildsList}
            />
          );
        },
      },
    ],
    [buildsList, error, experienceId, refetch, toast],
  );

  return (
    <UnlimitedDataTable
      columns={columns}
      data={buildsList}
      loading={loading}
      cursor={null}
      handleFetchMore={null}
    />
  );
};
