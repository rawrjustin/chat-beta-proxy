import React from 'react';
import { Button, Link } from 'src/theme';
import { HiOutlineCloudUpload } from 'react-icons/hi';
import { reserveUsername } from '../routes';

export const ReserveNameNavigationAction = () => {
  return (
    <Link style={{ textDecoration: 'none' }} href={reserveUsername()}>
      <Button
        size="lg"
        variant="ghost"
        color="users.purple"
        fontWeight={400}
        leftIcon={<HiOutlineCloudUpload />}
      >
        Reserve Username
      </Button>
    </Link>
  );
};
