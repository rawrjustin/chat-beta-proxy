import React from 'react';
import type { NextPage } from 'next';
import Head from 'src/general/components/Head';
import PageHeader from 'src/modules/PageHeader';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { useQuery } from '@apollo/client';
import { searchUserProfileQuery } from 'src/edge/gql/admin/searchUserProfileQuery';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import { ReserveNameNavigationAction } from 'src/modules/Actions/ReserveNameNavigationAction';
import { ActionsContainer } from 'src/modules/Actions/Index';
import { Box } from 'src/theme';
import { SignupNewUser } from 'src/modules/Actions/SignupNewUser';

const input = {
  flowAddress: '',
  sub: '',
  phoneNumber: '+16178584994',
};

const Users: NextPage = () => {
  const adminClient = useAdminClient();
  // Example of Admin API, Safe to remove
  useQuery(searchUserProfileQuery, {
    variables: {
      searchInput: input,
    },
    client: adminClient, // specify admin client here
  });
  return (
    <React.Fragment>
      <Head subtitle="Users" />
      <ContentLayoutWrapper
        pageHeader={<PageHeader title="Users" />}
        mainContent={<Box> Users Content (to be added)</Box>}
        actionsContainer={
          <ActionsContainer>
            <ReserveNameNavigationAction />
            <SignupNewUser />
          </ActionsContainer>
        }
      />
    </React.Fragment>
  );
};

export default Users;
