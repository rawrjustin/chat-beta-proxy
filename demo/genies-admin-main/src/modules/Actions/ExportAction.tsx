import React from 'react';
import { Button } from 'src/theme';
import { HiOutlineDownload } from 'react-icons/hi';

export const ExportAction = () => {
  return (
    <Button
      size="lg"
      variant="ghost"
      color="users.purple"
      fontWeight={400}
      leftIcon={<HiOutlineDownload />}
    >
      Export
    </Button>
  );
};
