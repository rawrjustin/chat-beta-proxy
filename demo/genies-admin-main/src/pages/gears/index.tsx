import { NextPage } from 'next';
import React from 'react';
import Head from 'src/general/components/Head';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import { GearsUnlimitedList } from 'src/modules/gears/GearsUnlimitedList';
import PageHeader from 'src/modules/PageHeader';

const Gears: NextPage = () => {
  return (
    <React.Fragment>
      <Head subtitle="Gears" />
      <ContentLayoutWrapper
        pageHeader={<PageHeader title="Gears" />}
        mainContent={<GearsUnlimitedList />}
      />
    </React.Fragment>
  );
};

export default Gears;
