import React from 'react';
import { Button, useDisclosure, Text, useToast } from 'src/theme';
import { UpsertReservedUsernameInput } from 'src/edge/__generated/types/admin/globalTypes';
import { useMutation } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { upsertReserveUsernamesMutation } from 'src/edge/gql/admin/upsertReservedUsernamesMutation';
import { SimpleModal } from 'src/general/modal/SimpleModal';
import Logger from 'shared/logger';
import { reserveUsername } from 'src/modules/routes';
import { useRouter } from 'next/router';

export const BatchAddReservedUsernameAction = ({
  reservedNames,
}: {
  reservedNames: UpsertReservedUsernameInput[];
}) => {
  const router = useRouter();
  const cancelRef = React.useRef(null);
  const adminClient = useAdminClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [upsertReserveUsernames] = useMutation(upsertReserveUsernamesMutation, {
    client: adminClient,
  });

  const handleUpsertReserveUsernames = async () => {
    let payload = {
      variables: {
        input: {
          upsertReservedUsernames: reservedNames,
        },
      },
    };
    const { data, errors } = await upsertReserveUsernames(payload);
    if (errors || data.upsertReservedUsernames?.failures?.length) {
      Logger.getInstance().error(`Upsert Reserved Username error`, {
        errorMessage: errors?.[0]?.message,
        upertFailure: data.upsertReservedUsernames?.failures,
        source: 'handleUpsertReserveUsernames',
      });
      const errorMsg = errors.length
        ? errors?.[0]?.message
        : `${data.upsertReservedUsernames?.failures?.length} reserved usernames fail to be upserted!`;
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } else {
      toast({
        title: 'Success.',
        description: `All the reserved username are upserted!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      router.push(reserveUsername());
    }
  };
  const buttonProps = {
    fontFamily: 'Roobert Regular',
    color: 'white',
    backgroundColor: 'users.purple',
    _selected: { backgroundColor: 'green.200', color: 'white' },
    _hover: {
      color: 'white',
      backgroundColor: reservedNames.length === 0 ? '' : 'green.200',
    },
  };
  return (
    <React.Fragment>
      <Button
        mb={4}
        size="lg"
        w="200px"
        variant="solid"
        fontWeight={400}
        isDisabled={reservedNames.length === 0}
        {...buttonProps}
        onClick={onOpen}
      >
        Add Reserved Name
      </Button>
      <SimpleModal
        isOpen={isOpen}
        onClose={onClose}
        alertHeader=""
        footer={
          <React.Fragment>
            <Button ref={cancelRef} onClick={onClose}>
              No, Take me back!
            </Button>
            <Button
              color="black"
              backgroundColor="users.purple"
              ml={3}
              onClick={handleUpsertReserveUsernames}
            >
              Submit
            </Button>
          </React.Fragment>
        }
      >
        <Text>Confirm to add all the reserved usernames?</Text>
      </SimpleModal>
    </React.Fragment>
  );
};
