import { NextPage } from 'next';
import Head from 'src/general/components/Head';
import { Fragment } from 'react';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import PageHeader from 'src/modules/PageHeader';
import { users } from 'src/modules/routes';
import SignUpUserFormWithEmail from 'src/modules/users/SignUpUserFormWithEmail';

const SignUpNewUsers: NextPage = () => {
  return (
    <Fragment>
      <Head subtitle="Users" />
      <ContentLayoutWrapper
        pageHeader={
          <PageHeader
            title="Sign Up New Users"
            previous={[{ title: 'Users', href: users() }]}
          />
        }
        mainContent={<SignUpUserFormWithEmail />}
      />
    </Fragment>
  );
};

export default SignUpNewUsers;
