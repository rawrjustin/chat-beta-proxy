import React from 'react';
import { Button, Link } from 'src/theme';
import { HiPlusSm } from 'react-icons/hi';
import { createDrop, createCollection } from 'src/modules/routes';

export const createTabProps = {
  fontFamily: 'Roobert Regular',
  borderColor: '#AA99FF',
  _selected: { backgroundColor: 'users.purple', color: 'white' },
  _hover: { color: 'white', backgroundColor: 'users.purple' },
};

export const Actions = {
  CREATE_DROP_ACTION: {
    text: 'Create New Drop',
    href: createDrop(),
  },
  CREATE_COLLECTION_ACTION: {
    text: 'Create New Collection',
    href: createCollection(),
  },
};

export const CreateAction = ({ action }: { action: any }) => {
  return (
    <Link style={{ textDecoration: 'none' }} href={action.href}>
      <Button
        size="lg"
        variant="outline"
        borderColor="users.purple"
        color="users.purple"
        whiteSpace="normal"
        fontWeight={400}
        blockSize="auto"
        w="200px"
        {...createTabProps}
        leftIcon={<HiPlusSm />}
      >
        {action.text}
      </Button>
    </Link>
  );
};
