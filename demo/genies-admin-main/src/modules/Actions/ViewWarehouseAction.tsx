import React from 'react';
import { Button, Link } from 'src/theme';
import { HiOutlineEye } from 'react-icons/hi';

interface Props {
  route: string;
}

export const ViewWarehouseAction = ({ route }: Props) => {
  const url = `${process.env.NEXT_PUBLIC_WAREHOUSE_SITE_URL}/${route}`;
  return (
    <Button
      size="lg"
      variant="ghost"
      color="users.purple"
      fontWeight={400}
      leftIcon={<HiOutlineEye />}
    >
      <Link
        _hover={{ textDecoration: 'none' }}
        href={url}
        isExternal
        rel="noopener noreferrer"
      >
        View On Warehouse
      </Link>
    </Button>
  );
};
