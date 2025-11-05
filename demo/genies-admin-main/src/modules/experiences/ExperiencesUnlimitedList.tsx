import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Text, Checkbox } from 'src/theme';
import { searchExperiences_searchExperiences_experiences as Experience } from 'src/edge/__generated/types/consumer/searchExperiences';
import { useConsumerClient } from 'src/lib/apollo/MultiApolloProvider';
import {
  CursorDirection,
  ExperienceBuildStatus,
  ExperienceFilters,
  ExperienceSortType,
  PaginationInput,
  ExperienceStatus,
} from 'src/edge/__generated/types/consumer/globalTypes';
import { useQuery } from '@apollo/client';
import { searchExperiencesQuery } from 'src/edge/gql/consumer/searchExperiencesQuery';
import Logger from 'shared/logger';
import { DataName, UnlimitedDataTable } from 'src/general/datatable';
import { experienceDetail } from '../routes';

const PAGINATION_LIMIT = 20;

export const ExperiencesUnlimitedList = () => {
  const consumerClient = useConsumerClient();
  const columns = useMemo<ColumnDef<Experience>[]>(
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
        id: 'Experiences',
        header: () => <Text fontSize="md">Experiences</Text>,
        accessorKey: 'name',
        cell: (props) => (
          <DataName
            name={props.renderValue() as string}
            url={experienceDetail(props.row.original.id)}
            isSelected={props.row.getIsSelected()}
          />
        ),
      },
      {
        id: 'Version',
        header: () => <Text fontSize="md">Version</Text>,
        accessorKey: 'version',
        cell: (props) => (
          <Text color={props.row.getIsSelected() ? 'users.purple' : 'white'}>
            {props.renderValue() as string}
          </Text>
        ),
      },
      {
        id: 'Owner ID',
        header: () => <Text fontSize="md">Owner ID</Text>,
        accessorKey: 'ownerId',
        cell: (props) => (
          <Text color={props.row.getIsSelected() ? 'users.purple' : 'white'}>
            {props.renderValue() as string}
          </Text>
        ),
      },
    ],
    [],
  );
  const [cursor, setCursor] = useState<string>('');
  const paginationInput: PaginationInput = {
    cursor: '',
    limit: PAGINATION_LIMIT,
    direction: CursorDirection.RIGHT,
  };
  const filters: ExperienceFilters = {
    byStatuses: [ExperienceBuildStatus.ALL],
    byExperienceStatus: ExperienceStatus.ALL,
  };
  const [experiencesList, setExperiencesList] = useState<Experience[]>([]);
  const { data, loading, refetch, error } = useQuery(searchExperiencesQuery, {
    variables: {
      input: {
        base: {
          pagination: paginationInput,
        },
        filters,
        sortBy: ExperienceSortType.UPDATED_AT_DESC,
      },
    },
    client: consumerClient,
    fetchPolicy: 'network-only',
  });
  if (error) {
    Logger.getInstance().error(
      `Search experiences query error:  ${error?.message}`,
      {
        errorMessage: error,
        source: 'searchExperiencesQuery',
      },
    );
  }
  useEffect(() => {
    if (data?.searchExperiences?.pagination?.nextCursor)
      setCursor(data.searchExperiences.pagination.nextCursor);

    if (data?.searchExperiences?.experiences) {
      if (data.searchExperiences.experiences.length < PAGINATION_LIMIT) {
        // when it comes to the last page, disable the load more button
        setCursor(null);
      }
      setExperiencesList((preList) => {
        return preList.concat(data.searchExperiences.experiences);
      });
    }
  }, [data]);

  const handleFetchMore = async () => {
    try {
      await refetch({
        input: {
          base: {
            pagination: {
              ...paginationInput,
              cursor,
            },
          },
          filters,
          sortBy: ExperienceSortType.UPDATED_AT_DESC,
        },
      });
    } catch (err) {
      Logger.getInstance().error(
        `Search experiences query refetch error:  ${error?.message}`,
        {
          errorMessage: error,
          source: 'searchExperiencesQuery refetch',
        },
      );
    }
  };

  return (
    <UnlimitedDataTable
      columns={columns}
      data={experiencesList}
      loading={loading}
      handleFetchMore={handleFetchMore}
      cursor={cursor}
    />
  );
};
