import React from 'react';
import { Button, Link } from 'src/theme';
import { HiPlusSm } from 'react-icons/hi';
import { createEdition } from 'src/modules/routes';
import router from 'next/router';

export const createEditionTabProps = {
  fontFamily: 'Roobert Regular',
  borderColor: '#AA99FF',
  _selected: { backgroundColor: 'users.purple', color: 'white' },
  _hover: { color: 'white', backgroundColor: 'users.purple' },
};

export const CreateEditionAction = () => {
  const { collectionId } = router.query;
  return (
    <Link
      style={{ textDecoration: 'none' }}
      href={createEdition(collectionId.toString())}
    >
      <Button
        size="lg"
        variant="outline"
        borderColor="users.purple"
        color="users.purple"
        fontWeight={400}
        w="200px"
        {...createEditionTabProps}
        leftIcon={<HiPlusSm />}
      >
        Create New Edition
      </Button>
    </Link>
  );
};
