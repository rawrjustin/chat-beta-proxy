import React from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import Head from 'src/general/components/Head';
import PageHeader from 'src/modules/PageHeader';
import {
  ActionsContainer,
  ExportAction,
  ViewWarehouseAction,
} from 'src/modules/Actions/Index';
import { drops } from 'src/modules/routes';
import { TabContainer, TabConfig } from 'src/general/components/TabContainer';
import { Skeleton } from 'src/theme';
import { useQuery } from '@apollo/client';
import { useConsumerClient } from 'src/lib/apollo/MultiApolloProvider';
import { searchDropsQuery } from 'src/edge/gql/consumer/searchDropsQuery';
import { DropStatus } from 'src/edge/__generated/types/consumer/globalTypes';
import { DropEditionListing } from 'src/modules/drops/detail/DropEditionListing';
import { DropDetails } from 'src/modules/drops/detail/DropDetails';
import Logger from 'shared/logger';
import { useGetFeatureFlags, AdminFeatureFlags } from 'src/lib/statsig';
import { ContentLayoutWrapper } from 'src/general/components/Layout';

const DropDetail: NextPage = () => {
  const enableExportAction = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_EXPORT_ACTION,
  );
  const router = useRouter();
  const consumerClient = useConsumerClient();
  const { id: queryDropId } = router.query;
  const dropId = Array.isArray(queryDropId) ? queryDropId[0] : queryDropId;

  const tabConfig: TabConfig[] = [
    {
      name: 'Info',
      content: <DropDetails dropId={dropId} />,
    },
    {
      name: 'Editions',
      content: <DropEditionListing dropId={dropId} />,
    },
  ];

  const { loading, data, error } = useQuery(searchDropsQuery, {
    variables: {
      searchInput: {
        filters: {
          byID: [dropId],
          notIDs: [],
          byDropStatuses: [DropStatus.ALL],
        },
      },
    },
    client: consumerClient,
  });
  const title = data ? data?.searchDrops?.drops[0]?.title : '';

  if (error) {
    Logger.getInstance().error(`searchDropsQuery error: ${error.message}`, {
      errorMessage: error.message,
      dropId,
      source: 'DropDetail',
    });
  }

  return (
    <React.Fragment>
      <Head subtitle="Drops" />
      <ContentLayoutWrapper
        pageHeader={
          <Skeleton isLoaded={!loading}>
            <PageHeader
              title={title}
              previous={[{ title: 'Drops', href: drops() }]}
            />
          </Skeleton>
        }
        mainContent={<TabContainer config={tabConfig} />}
        actionsContainer={
          <ActionsContainer>
            {enableExportAction && <ExportAction />}
            <ViewWarehouseAction route={`collection/${dropId}`} />
          </ActionsContainer>
        }
      />
    </React.Fragment>
  );
};

export default DropDetail;

// Add getServerSideProps() to Disable the static page optimizatin
// It will cause router.query to be empty at beginning
export async function getServerSideProps(context) {
  return {
    props: {}, // will be passed to the page component as props
  };
}
