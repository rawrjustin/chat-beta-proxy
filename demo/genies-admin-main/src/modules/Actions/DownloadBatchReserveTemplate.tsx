import React from 'react';
import { Button, Link } from 'src/theme';
import { HiOutlineDownload } from 'react-icons/hi';
import { batchReserveUsernameTemplate } from '../routes';

export const DownloadBatchReserveTemplate = () => {
  return (
    <Link
      style={{ textDecoration: 'none' }}
      href={batchReserveUsernameTemplate()}
    >
      <Button
        size="lg"
        variant="ghost"
        color="users.purple"
        fontWeight={400}
        leftIcon={<HiOutlineDownload />}
      >
        Download Template
      </Button>
    </Link>
  );
};
