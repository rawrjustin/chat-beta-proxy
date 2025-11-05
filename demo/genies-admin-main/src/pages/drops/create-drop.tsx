import React from 'react';
import type { NextPage } from 'next';
import PageHeader from 'src/modules/PageHeader';
import Head from 'src/general/components/Head';
import { drops } from 'src/modules/routes';
import { CreateDropContainer } from 'src/modules/drops/create/CreateDropContainer';
import { ContentLayoutWrapper } from 'src/general/components/Layout';

const Drops: NextPage = () => {
  return (
    <React.Fragment>
      <Head subtitle="Create New Drop" />
      <ContentLayoutWrapper
        pageHeader={
          <PageHeader
            title="Create New Drop"
            previous={[{ title: 'Drops', href: drops() }]}
          />
        }
        mainContent={<CreateDropContainer />}
      />
    </React.Fragment>
  );
};

export default Drops;
