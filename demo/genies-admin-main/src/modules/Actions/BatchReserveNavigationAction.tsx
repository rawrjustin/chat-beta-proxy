import React from 'react';
import { Button, Link } from 'src/theme';
import { HiOutlineCloudUpload } from 'react-icons/hi';
import { batchReserveUsername } from '../routes';

export const BatchReserveNavigationAction = () => {
  return (
    <Link style={{ textDecoration: 'none' }} href={batchReserveUsername()}>
      <Button
        size="lg"
        variant="ghost"
        color="users.purple"
        fontWeight={400}
        leftIcon={<HiOutlineCloudUpload />}
      >
        Batch Reserve Name
      </Button>
    </Link>
  );
};
