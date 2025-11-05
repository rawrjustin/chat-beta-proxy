import React from 'react';
import type { NextPage } from 'next';
import Head from 'src/general/components/Head';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import PageHeader from 'src/modules/PageHeader';
import { ReserveUsernameContainer } from 'src/modules/users/ReserveUsernameContainer';
import { reserveUsername, users } from 'src/modules/routes';

const BatchReserveName: NextPage = () => {
  return (
    <React.Fragment>
      <Head subtitle="Users" />
      <ContentLayoutWrapper
        pageHeader={
          <PageHeader
            title="Batch"
            previous={[
              { title: 'Users', href: users() },
              { title: 'Reserve Usernames', href: reserveUsername() },
            ]}
          />
        }
        mainContent={<ReserveUsernameContainer />}
      />
    </React.Fragment>
  );
};

export default BatchReserveName;
