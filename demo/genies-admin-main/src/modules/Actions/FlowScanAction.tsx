import React from 'react';
import { Button, Link } from 'src/theme';
import { HiExternalLink } from 'react-icons/hi';
export const FlowScanAction = ({ txID = null }: { txID?: string }) => {
  const url =
    txID == null
      ? process.env.NEXT_PUBLIC_FLOWSCAN_GENIES
      : `${process.env.NEXT_PUBLIC_FLOWSCAN_EVENT}/${txID}`;
  return (
    <Button
      size="lg"
      variant="ghost"
      color="users.purple"
      fontWeight={400}
      leftIcon={<HiExternalLink />}
    >
      <Link
        _hover={{ textDecoration: 'none' }}
        href={url}
        isExternal
        rel="noopener noreferrer"
      >
        FlowScan
      </Link>
    </Button>
  );
};
