import React from 'react';
import { Button, Link } from 'src/theme';
import { HiOutlineUserAdd } from 'react-icons/hi';
import { signUpNewUsers } from '../routes';

export const SignupNewUser = () => {
  return (
    <Link style={{ textDecoration: 'none' }} href={signUpNewUsers()}>
      <Button
        size="lg"
        variant="ghost"
        color="users.purple"
        fontWeight={400}
        leftIcon={<HiOutlineUserAdd />}
      >
        Sign Up New User
      </Button>
    </Link>
  );
};
