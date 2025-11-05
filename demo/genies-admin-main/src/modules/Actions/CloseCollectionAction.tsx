import React, { useState, useRef } from 'react';
import {
  Button,
  Link,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  Text,
  Flex,
  useDisclosure,
  useToast,
} from 'src/theme';
import { HiX } from 'react-icons/hi';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { closeCollectionMutation } from 'src/edge/gql/admin/closeCollectionMutation';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { collections } from 'src/modules/routes';
import Logger from 'shared/logger';

export const CloseCollectionAction = ({
  collectionFlowId,
  collectionId,
}: {
  collectionFlowId: Number;
  collectionId: string;
}) => {
  const router = useRouter();
  const adminClient = useAdminClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [closingCollection, setClosingCollection] = useState(false);
  const toast = useToast();
  const [closeCollection] = useMutation(closeCollectionMutation, {
    client: adminClient,
  });

  const handleCloseCollection = async () => {
    setClosingCollection(true);
    const payload = {
      variables: {
        input: {
          flowID: Number(collectionFlowId),
          idempotencyKey: uuidv4(),
          collectionID: collectionId,
        },
      },
    };
    try {
      const { errors, data } = await closeCollection(payload);
      setClosingCollection(false);
      if (errors) {
        throw new Error(errors?.[0]?.message);
      }
      if (!data?.closeCollection?.success) {
        throw new Error('The close collection mutation fails.');
      }
      toast({
        title: 'Success.',
        description: `The collection is closed successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      router.push(collections());
    } catch (e) {
      toast({
        title: 'Error',
        description: `Close Collection Error: ${e.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(`Close Collection Error: ${e.message}`, {
        errorMessage: e.message,
        source: 'handleCloseCollection',
      });
      setClosingCollection(false);
    }
  };

  const closeCollectionButtonProps = {
    fontFamily: 'Roobert Regular',
    borderColor: '#AA99FF',
    _selected: { backgroundColor: 'users.purple', color: 'white' },
    _hover: { color: 'white', backgroundColor: 'users.purple' },
  };
  return (
    <React.Fragment>
      <Link style={{ textDecoration: 'none' }}>
        <Button
          size="lg"
          variant="outline"
          borderColor="users.purple"
          color="users.purple"
          fontWeight={400}
          w="200px"
          {...closeCollectionButtonProps}
          leftIcon={<HiX />}
          disabled={!collectionFlowId || !collectionId}
          onClick={onOpen}
        >
          Close Collection
        </Button>
      </Link>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={() => {
          onClose();
        }}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent maxW="2xl">
          <AlertDialogHeader>Confirm The Following</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody width="max-content">
            <Flex direction="column" mt={4} mb={4}>
              <Text fontSize={20}>Confirm to close this collection?</Text>
            </Flex>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              isLoading={closingCollection}
            >
              Cancel
            </Button>
            <Button
              color="black"
              backgroundColor="users.purple"
              ml={3}
              onClick={handleCloseCollection}
              disabled={!collectionFlowId || !collectionId}
              isLoading={closingCollection}
            >
              Close Collection!
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};
