import { NextPage } from 'next';
import React from 'react';
import Head from 'src/general/components/Head';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import { ExperiencesUnlimitedList } from 'src/modules/experiences/ExperiencesUnlimitedList';
import PageHeader from 'src/modules/PageHeader';

const Experiences: NextPage = () => {
  return (
    <React.Fragment>
      <Head subtitle="Experiences" />
      <ContentLayoutWrapper
        pageHeader={<PageHeader title="Experiences" />}
        mainContent={<ExperiencesUnlimitedList />}
      />
    </React.Fragment>
  );
};

export default Experiences;
