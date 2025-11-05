import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'src/general/components/Head';
import { Spinner, VStack, Text } from 'src/theme';
import { users } from 'src/modules/routes';

const Home: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Users page as the default landing page
    router.replace(users());
  }, [router]);

  return (
    <React.Fragment>
      <Head title="Genies Admin" />
      <VStack spacing={4} justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text color="gray.600">Redirecting to Users...</Text>
      </VStack>
    </React.Fragment>
  );
};

export default Home;
