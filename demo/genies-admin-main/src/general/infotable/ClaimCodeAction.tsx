import { Button, Link } from 'src/theme';
import React from 'react';

export const ClaimCodeAction: React.FC = () => {
  const url = `${process.env.NEXT_PUBLIC_STATSIG_CLAIM_URL}`;
  return (
    <React.Fragment>
      <Button>
        <Link
          _hover={{ textDecoration: 'none' }}
          href={url}
          isExternal
          rel="noopener noreferrer"
        >
          Edit Claim Code
        </Link>
      </Button>
    </React.Fragment>
  );
};
