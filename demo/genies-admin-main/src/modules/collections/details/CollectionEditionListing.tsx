import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { searchEditionsQuery } from 'src/edge/gql/admin/searchEditionsQuery';
import {
  Edition,
  EditionListing,
  formatEditionData,
} from 'src/modules/Edition';
import { useToast } from 'src/theme';
import Logger from 'shared/logger';

export const CollectionEditionListing = ({ flowId }: { flowId: string }) => {
  const adminClient = useAdminClient();
  const toast = useToast();
  const { data, loading, error } = useQuery(searchEditionsQuery, {
    variables: {
      searchInput: {
        filters: {
          byFlowIDs: [],
          byCollectionFlowIDs: [flowId],
          byDropIDs: [],
        },
        isSaleStatsRequired: true,
      },
    },
    client: adminClient,
    skip: !flowId,
  });
  const defaultData = useMemo<Edition[]>(() => [], []);
  const formateddata = data
    ? formatEditionData(data.searchEditions?.editions)
    : defaultData;

  if (error) {
    toast({
      title: 'Graphql Error',
      description: `Search edition query error:  ${error?.message}`,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
    Logger.getInstance().error(`searchEditionsQuery error: ${error.message}`, {
      editionFlowId: flowId,
      errorMessage: error.message,
      source: 'CollectionEditionListing',
    });
  }

  return <EditionListing data={formateddata} loading={loading} />;
};
