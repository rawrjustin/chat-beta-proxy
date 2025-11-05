import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import Head from 'src/general/components/Head';
import PageHeader from 'src/modules/PageHeader';
import { ActionsContainer, ExportAction } from 'src/modules/Actions/Index';
import { collections } from 'src/modules/routes';
import { TabContainer, TabConfig } from 'src/general/components/TabContainer';
import { Flex, Skeleton, useToast } from 'src/theme';
import { CollectionsDetailForm } from 'src/modules/collections';
import { CollectionEditionListing } from 'src/modules/collections';
import { useQuery } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { searchCollectionsQuery } from 'src/edge/gql/admin/searchCollectionsQuery';
import { useGetFeatureFlags, AdminFeatureFlags } from 'src/lib/statsig';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import { CreateEditionAction } from 'src/modules/Actions/CreateEditionAction';
import { CloseCollectionAction } from 'src/modules/Actions/CloseCollectionAction';
import Logger from 'shared/logger';
import { PlatformStatus } from 'src/edge/__generated/types/admin/globalTypes';
import { NewCollectionProps } from 'src/modules/collections/create/CreateCollectionContainer';
import { PublishCollectionAction } from 'src/modules/Actions/PublishCollectionAction';
import { CreateCollection } from 'src/modules/collections/create/CreateCollection';
import { SaveCollectionAction } from 'src/modules/Actions/SaveCollectionAction';

const CollectionDetail: NextPage = () => {
  const enableExportAction = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_EXPORT_ACTION,
  );

  const enableCreateEdition = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_CREATE_EDITION,
  );
  const router = useRouter();
  const adminClient = useAdminClient();
  const toast = useToast();
  const [collectionFlowId, setCollectionFlowId] = useState();
  const { collectionId } = router.query;
  const singleCollectionId = Array.isArray(collectionId)
    ? collectionId[0]
    : collectionId;
  const { loading, data, refetch, error } = useQuery(searchCollectionsQuery, {
    variables: {
      searchInput: {
        filters: {
          byCollectionIDs: [singleCollectionId],
        },
        pageSize: 1,
      },
    },
    client: adminClient,
  });
  if (error) {
    toast({
      title: 'Graphql Error',
      description: `Search collection query error:  ${error?.message}`,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
    Logger.getInstance().error(
      `Search collection query error:  ${error?.message}`,
      {
        collectionFlowId,
        errorMessage: error,
        source: 'searchCollectionsQuery',
      },
    );
  }

  const [newCollectionInfo, setNewCollectionInfo] =
    useState<NewCollectionProps>({
      title: '',
      description: '',
      seriesFlowID: parseInt(process.env.NEXT_PUBLIC_GENIES_SERIES_FLOW_ID),
      seriesName: process.env.NEXT_PUBLIC_GENIES_SERIES_NAME,
    });

  useEffect(() => {
    setNewCollectionInfo({
      title: data?.searchCollections?.collections[0]?.name,
      description:
        data?.searchCollections?.collections[0]?.metadata?.description,
      seriesFlowID: parseInt(process.env.NEXT_PUBLIC_GENIES_SERIES_FLOW_ID),
      seriesName: process.env.NEXT_PUBLIC_GENIES_SERIES_NAME,
    });
    setCollectionFlowId(data?.searchCollections?.collections[0]?.flowID);
  }, [data]);

  const isDraft =
    data?.searchCollections?.collections[0]?.platformStatus ===
    PlatformStatus.DRAFT;

  const tabConfig: TabConfig[] = [
    {
      name: 'Info',
      content: (
        <CollectionsDetailForm flowId={collectionFlowId} refetch={refetch} />
      ),
    },
    {
      name: 'Editions',
      content: <CollectionEditionListing flowId={collectionFlowId} />,
    },
  ];

  const collectionName = data ? data.searchCollections.collections[0].name : '';

  return (
    <React.Fragment>
      <Head subtitle="Collections" />
      <ContentLayoutWrapper
        pageHeader={
          <Skeleton isLoaded={!loading}>
            <PageHeader
              title={collectionName}
              previous={[{ title: 'Collections', href: collections() }]}
            />
          </Skeleton>
        }
        mainContent={
          <Skeleton isLoaded={!loading}>
            {isDraft ? (
              <CreateCollection
                newCollectionInfo={newCollectionInfo}
                setNewCollectionInfo={setNewCollectionInfo}
              />
            ) : (
              <TabContainer config={tabConfig} />
            )}
          </Skeleton>
        }
        actionsContainer={
          isDraft ? (
            <Flex w="2xs" ml={25} mr={25} align="flex-start">
              <ActionsContainer>
                <SaveCollectionAction
                  draftCollectionInfo={newCollectionInfo}
                  draftCollectionID={singleCollectionId}
                />
                <PublishCollectionAction
                  newCollectionInfo={newCollectionInfo}
                  collectionId={singleCollectionId}
                />
              </ActionsContainer>
            </Flex>
          ) : (
            <ActionsContainer>
              {enableExportAction && <ExportAction />}
              {enableCreateEdition && <CreateEditionAction />}
              <CloseCollectionAction
                collectionFlowId={collectionFlowId}
                collectionId={singleCollectionId}
              />
            </ActionsContainer>
          )
        }
      />
    </React.Fragment>
  );
};

export default CollectionDetail;

// Add getServerSideProps() to Disable the static page optimizatin
// It will cause router.query to be empty at beginning
export async function getServerSideProps(context) {
  return {
    props: {}, // will be passed to the page component as props
  };
}
