import React from 'react';
import type { NextPage } from 'next';
import Head from 'src/general/components/Head';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import PageHeader from 'src/modules/PageHeader';
import { ActionsContainer } from 'src/modules/Actions/Index';
import { BatchReserveNavigationAction } from 'src/modules/Actions/BatchReserveNavigationAction';
import { ReservedUsernameList } from 'src/modules/users/ReservedUsernameList';
import { ExportAllReserveUsernames } from 'src/modules/Actions/ExportAllReservedUsernames';
import { users } from 'src/modules/routes';
import { DeleteReserveNameProvider } from 'src/modules/users/DeleteReserveNameContext';

const BatchReserveName: NextPage = () => {
  return (
    <React.Fragment>
      <Head subtitle="Users" />
      <ContentLayoutWrapper
        pageHeader={
          <PageHeader
            title="Reserve Usernames"
            previous={[{ title: 'Users', href: users() }]}
          />
        }
        mainContent={
          <DeleteReserveNameProvider>
            <ReservedUsernameList />
          </DeleteReserveNameProvider>
        }
        actionsContainer={
          <ActionsContainer>
            <BatchReserveNavigationAction />
            <ExportAllReserveUsernames />
          </ActionsContainer>
        }
      />
    </React.Fragment>
  );
};

export default BatchReserveName;
