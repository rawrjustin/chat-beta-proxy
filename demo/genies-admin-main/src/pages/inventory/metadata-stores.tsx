import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { AdminContainer } from 'src/modules/containers';
import { MetadataStoreManager } from 'src/modules/inventory';

const MetadataStoresPage: NextPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Metadata Store Manager - Genies Admin</title>
        <meta
          name="description"
          content="Manage metadata stores, templates, and validation"
        />
      </Head>
      <AdminContainer>
        <MetadataStoreManager />
      </AdminContainer>
    </React.Fragment>
  );
};

export default MetadataStoresPage;
