import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { AdminContainer } from 'src/modules/containers';
import { DefaultItemsManager } from 'src/modules/inventory';

const DefaultItemsPage: NextPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Default Items Manager - Genies Admin</title>
        <meta
          name="description"
          content="Manage default items for organizations and applications"
        />
      </Head>
      <AdminContainer>
        <DefaultItemsManager />
      </AdminContainer>
    </React.Fragment>
  );
};

export default DefaultItemsPage;
