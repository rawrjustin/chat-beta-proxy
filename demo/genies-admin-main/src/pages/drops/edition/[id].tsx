import React, { useState } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import Head from 'src/general/components/Head';
import PageHeader from 'src/modules/PageHeader';
import {
  ActionsContainer,
  ExportAction,
  ViewWarehouseAction,
  CopyLinkAction,
  FlowScanAction,
} from 'src/modules/Actions/Index';
import { dropsDetail, drops } from 'src/modules/routes';
import { Skeleton } from 'src/theme';
import { EditionDetails } from 'src/modules/Edition/EditionDetails';
import { useConsumerClient } from 'src/lib/apollo/MultiApolloProvider';
import { useQuery } from '@apollo/client';
import { searchDropEditionsQuery } from 'src/edge/gql/consumer/searchDropEditionsQuery';
import Logger from 'shared/logger';
import { useGetFeatureFlags, AdminFeatureFlags } from 'src/lib/statsig';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import { searchDropTitleQuery } from 'src/edge/gql/consumer/searchDropsQuery';

const DropEdition: NextPage = () => {
  const enableExportAction = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_EXPORT_ACTION,
  );
  const [dropEditionID, setDropEditionID] = useState<string | null>(null);
  const [dropEditionTitle, setDropEditionTitle] = useState<string | null>(null);
  const router = useRouter();
  const { id: editionId } = router.query;
  const editionFlowId = Array.isArray(editionId) ? editionId[0] : editionId;
  const consumerClient = useConsumerClient();

  const {
    data: dropEditionData,
    loading: dropEditionLoading,
    error: dropEditionError,
  } = useQuery(searchDropEditionsQuery, {
    variables: {
      searchInput: {
        filters: {
          byID: [dropEditionID],
          byCollectionID: [],
        },
      },
    },
    client: consumerClient,
    skip: !dropEditionID,
  });

  if (dropEditionError) {
    Logger.getInstance().error(
      `searchDropEditionsQuery filterd by dropEditionId error: ${dropEditionError.message}`,
      {
        errorMessage: dropEditionError.message,
        dropEditionID,
        source: 'EditionDetails',
      },
    );
  }
  const dropId = dropEditionData?.searchDropEditions?.dropEditions[0]?.dropId;
  const {
    data: dropData,
    loading: dropDataLoading,
    error: dropDataError,
  } = useQuery(searchDropTitleQuery, {
    variables: {
      searchInput: {
        filters: {
          byID: [dropId],
          notIDs: [],
          byDropStatuses: [],
        },
      },
    },
    client: consumerClient,
    skip: !dropId,
  });

  if (dropDataError) {
    Logger.getInstance().error(
      `searchDropTitleQuery filterd by dropId error: ${dropDataError.message}`,
      {
        errorMessage: dropDataError.message,
        dropId,
        source: 'EditionDetails',
      },
    );
  }
  const dropTitle = !dropDataLoading
    ? dropData?.searchDrops?.drops[0]?.title
    : null;

  return (
    <React.Fragment>
      <Head subtitle={`${editionId}`} />
      <ContentLayoutWrapper
        pageHeader={
          <Skeleton
            isLoaded={!dropEditionLoading && !dropDataLoading && dropTitle}
          >
            <PageHeader
              title={`${dropEditionTitle}`}
              previous={[
                { title: 'Drops', href: drops() },
                {
                  title: `${dropTitle}`,
                  href: dropsDetail(dropId?.toString()),
                },
              ]}
            />
          </Skeleton>
        }
        mainContent={
          <EditionDetails
            flowId={editionFlowId}
            setDropEditionID={setDropEditionID}
            setDropEditionTitle={setDropEditionTitle}
          />
        }
        actionsContainer={
          <ActionsContainer>
            {enableExportAction && <ExportAction />}
            <CopyLinkAction />
            <FlowScanAction />
            {dropEditionID && (
              <ViewWarehouseAction
                route={`collection/wearables/${dropEditionID}`}
              />
            )}
          </ActionsContainer>
        }
      />
    </React.Fragment>
  );
};

export default DropEdition;
