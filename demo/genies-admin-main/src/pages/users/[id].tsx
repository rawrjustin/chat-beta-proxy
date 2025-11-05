import React from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import Head from 'src/general/components/Head';
import PageHeader from 'src/modules/PageHeader';
import { users } from 'src/modules/routes/index';
import { Flex } from 'src/theme';
import {
  ActionsContainer,
  CopyLinkAction,
  ViewWarehouseAction,
  ExportAction,
} from 'src/modules/Actions/Index';
import { UserDetails } from 'src/modules/users/UserDetails';
import { useGetFeatureFlags, AdminFeatureFlags } from 'src/lib/statsig';

const User: NextPage = () => {
  const enableExportAction = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_EXPORT_ACTION,
  );
  const router = useRouter();
  const { id: userId } = router.query;

  return (
    <React.Fragment>
      <Head subtitle={`${userId}`} />
      <Flex w="full">
        <Flex w="full" flexDirection="column">
          <Flex w="full" align="flex-start" mb={6}>
            <PageHeader
              title={`${userId}`}
              previous={[{ title: 'Users', href: users() }]}
            />
          </Flex>
          <Flex w="full" justify="center" flexDirection="column">
            <UserDetails />
          </Flex>
        </Flex>
        <Flex w="2xs" mt={100} ml={25} mr={25} align="flex-start">
          <ActionsContainer>
            {enableExportAction && <ExportAction />}
            <ViewWarehouseAction route={`user/${userId}`} />
            <CopyLinkAction />
          </ActionsContainer>
        </Flex>
      </Flex>
    </React.Fragment>
  );
};

export default User;
