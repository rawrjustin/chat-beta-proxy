import React from 'react';
import type { NextPage } from 'next';
import PageHeader from 'src/modules/PageHeader';
import Head from 'src/general/components/Head';
import { collectionsDetail } from 'src/modules/routes';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import { useRouter } from 'next/router';
import { CreateEditionContainer } from 'src/modules/Edition/CreateEditionContainer';
import { useQuery } from '@apollo/client';
import { searchCollectionsQuery } from 'src/edge/gql/admin/searchCollectionsQuery';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { Skeleton } from 'src/theme';

const Editions: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const collectionID = Array.isArray(id) ? id[0] : id;
  const adminClient = useAdminClient();

  const { loading, data } = useQuery(searchCollectionsQuery, {
    variables: {
      searchInput: {
        filters: {
          byCollectionIDs: [collectionID],
        },
        pageSize: 1,
      },
    },
    client: adminClient,
    skip: !collectionID,
  });
  const collectionName = data?.searchCollections?.collections[0]?.name || '';
  const collectionFlowId = Number(
    data?.searchCollections?.collections[0]?.flowID,
  );
  return (
    <React.Fragment>
      <Head subtitle="Create New Edition" />
      <ContentLayoutWrapper
        pageHeader={
          <Skeleton isLoaded={!loading}>
            <PageHeader
              title="Create New Edition"
              previous={[
                {
                  title: collectionName,
                  href: collectionsDetail(collectionID),
                },
              ]}
            />
          </Skeleton>
        }
        mainContent={
          <CreateEditionContainer
            collectionName={collectionName}
            collectionFlowId={collectionFlowId}
          />
        }
      />
    </React.Fragment>
  );
};

export default Editions;
