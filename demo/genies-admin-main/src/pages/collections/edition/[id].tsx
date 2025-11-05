import React, { useEffect, useState } from 'react';
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
  PublishEditionAction,
} from 'src/modules/Actions/Index';
import { collections, collectionsDetail } from 'src/modules/routes';
import { Flex, Skeleton } from 'src/theme';
import { EditionDetails } from 'src/modules/Edition/EditionDetails';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { useQuery } from '@apollo/client';
import { searchEditionsQuery } from 'src/edge/gql/admin/searchEditionsQuery';
import { searchCollectionsQuery } from 'src/edge/gql/admin/searchCollectionsQuery';
import { useGetFeatureFlags, AdminFeatureFlags } from 'src/lib/statsig';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import {
  EditionImageType,
  PlatformStatus,
} from 'src/edge/__generated/types/admin/globalTypes';
import { NewEditionProps } from 'src/modules/Edition/CreateEditionContainer';
import { CreateEdition } from 'src/modules/Edition/CreateEdition';
import { SaveDraftEditionAction } from 'src/modules/Actions/SaveDraftEditionAction';
import { RetireEditionAction } from 'src/modules/Actions/RetireEditionAction';

const CollectionEdition: NextPage = () => {
  const enableExportAction = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_EXPORT_ACTION,
  );
  const [dropEditionID, setDropEditionID] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;
  const editionId = Array.isArray(id) ? id[0] : id;
  const adminClient = useAdminClient();

  const { loading, data, refetch } = useQuery(searchEditionsQuery, {
    variables: {
      searchInput: {
        filters: {
          byFlowIDs: [],
          byCollectionFlowIDs: [],
          byDropIDs: [],
          byIDs: [editionId],
        },
      },
    },
    client: adminClient,
    skip: !editionId,
  });

  const isDraft =
    data?.searchEditions?.editions[0]?.platformStatus === PlatformStatus.DRAFT;

  const collectionFlowId = data?.searchEditions?.editions[0]?.collectionFlowID;
  const flowId = data?.searchEditions?.editions?.[0]?.flowID;

  /**
   * @jietang, this query could be removed, The collection name get from
   * data?.searchEditions?.editions[0]?.collection?.name But in staging, there
   * is no collection associated with edition
   *
   * @barry currently, searchEditionsQuery from admin client miss some data like dropEditionID, info about collection;
   * later when these fields are filled with values, searchCollectionsQuery can be removed
   * and can get dropEditionID in page level instead of in EditionDetails component
   */

  const { loading: collectionLoading, data: collectionData } = useQuery(
    searchCollectionsQuery,
    {
      variables: {
        searchInput: {
          filters: {
            byFlowIDs: [collectionFlowId],
            byCreatorIDs: [],
          },
          pageSize: 1,
        },
      },
      client: adminClient,
      skip: loading || !collectionFlowId,
    },
  );

  const editionName = data?.searchEditions?.editions[0]?.name || '';
  const collectionName =
    collectionData?.searchCollections?.collections[0]?.name || '';
  const collectionId = collectionData?.searchCollections?.collections?.[0].id;
  const savedImageUrl =
    data?.searchEditions?.editions[0]?.metadata?.images?.find(
      (e) => e.type === EditionImageType.EDITION_IMAGE_TYPE_CONTAINER,
    ).url;

  const [imageFile, setImageFile] = React.useState<File>();
  const [draftEditionInfo, setDraftEditionInfo] = useState<NewEditionProps>({
    name: '',
    description: '',
    publisher: '',
    rarity: undefined,
    designSlot: undefined,
    avatarWearableSKU: '',
    images: [],
  });
  useEffect(() => {
    setDraftEditionInfo({
      name: data?.searchEditions?.editions?.[0]?.name,
      description: data?.searchEditions?.editions?.[0]?.metadata?.description,
      publisher: data?.searchEditions?.editions?.[0]?.metadata?.publisher,
      rarity: data?.searchEditions?.editions?.[0]?.metadata?.rarity,
      designSlot: data?.searchEditions?.editions?.[0]?.metadata?.designSlot,
      avatarWearableSKU:
        data?.searchEditions?.editions?.[0]?.metadata?.avatarWearableSKU,
      images: data?.searchEditions?.editions?.[0]?.metadata?.images,
    });
  }, [data]);

  return (
    <React.Fragment>
      <Head subtitle={`${editionId}`} />
      <ContentLayoutWrapper
        pageHeader={
          <Skeleton isLoaded={!loading && !collectionLoading}>
            <PageHeader
              title={`${editionName}`}
              previous={[
                { title: 'Collections', href: collections() },
                {
                  title: `${collectionName}`,
                  href: collectionsDetail(collectionId),
                },
              ]}
            />
          </Skeleton>
        }
        mainContent={
          <Skeleton isLoaded={!loading && !collectionLoading}>
            {isDraft ? (
              <CreateEdition
                newEditionInfo={draftEditionInfo}
                setNewEditionInfo={setDraftEditionInfo}
                imageFile={imageFile}
                setImageFile={setImageFile}
                savedImageUrl={savedImageUrl}
              />
            ) : (
              <EditionDetails
                flowId={flowId}
                setDropEditionID={setDropEditionID}
              />
            )}
          </Skeleton>
        }
        actionsContainer={
          isDraft ? (
            <Flex w="2xs" ml={25} mr={25} align="flex-start">
              <ActionsContainer>
                <SaveDraftEditionAction
                  newEditionInfo={draftEditionInfo}
                  imageFile={imageFile}
                  collectionFlowId={collectionFlowId}
                  draftEditionID={editionId}
                  collectionName={collectionName}
                  refetch={refetch}
                />
                <PublishEditionAction
                  draftEditionID={editionId}
                  newEditionInfo={draftEditionInfo}
                  imageFile={imageFile}
                  collectionFlowId={collectionFlowId}
                  collectionName={collectionName}
                />
                <RetireEditionAction
                  editionFlowId={flowId}
                  editionId={editionId}
                  collectionId={collectionId}
                />
              </ActionsContainer>
            </Flex>
          ) : (
            <ActionsContainer>
              {enableExportAction && <ExportAction />}
              <CopyLinkAction />
              <FlowScanAction />
              {dropEditionID && (
                <ViewWarehouseAction
                  route={`collection/wearables/${dropEditionID}`}
                />
              )}
              <RetireEditionAction
                editionFlowId={flowId}
                editionId={editionId}
                collectionId={collectionId}
              />
            </ActionsContainer>
          )
        }
      />
    </React.Fragment>
  );
};

export default CollectionEdition;
