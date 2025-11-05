import React from 'react';
import type { NextPage } from 'next';
import PageHeader from 'src/modules/PageHeader';
import Head from 'src/general/components/Head';
import { collections } from 'src/modules/routes';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import { CreateCollectionContainer } from 'src/modules/collections/create/CreateCollectionContainer';

const Collections: NextPage = () => {
  return (
    <React.Fragment>
      <Head subtitle="Create New Collection" />
      <ContentLayoutWrapper
        pageHeader={
          <PageHeader
            title="Create New Collection"
            previous={[{ title: 'Collections', href: collections() }]}
          />
        }
        mainContent={<CreateCollectionContainer />}
      />
    </React.Fragment>
  );
};

export default Collections;
