import { NextPage } from 'next';
import React from 'react';
import Head from 'src/general/components/Head';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import PageHeader from 'src/modules/PageHeader';
import { GetThingsUnlimitedList } from 'src/modules/things/GetThingsUnlimitedList';

const Things: NextPage = () => {
  return (
    <React.Fragment>
      <Head subtitle="Things" />
      <ContentLayoutWrapper
        pageHeader={<PageHeader title="Things" />}
        mainContent={<GetThingsUnlimitedList />}
      />
    </React.Fragment>
  );
};

export default Things;
