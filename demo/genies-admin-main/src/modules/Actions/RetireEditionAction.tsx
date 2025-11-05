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
import { retireEditionMutation } from 'src/edge/gql/admin/retireEditionMutation';
import { useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import { collectionsDetail } from 'src/modules/routes';
import { useRouter } from 'next/router';
import Logger from 'shared/logger';

export const RetireEditionAction = ({
  editionFlowId,
  editionId,
  collectionId,
}: {
  editionFlowId: Number;
  editionId: string;
  collectionId: string;
}) => {
  const router = useRouter();
  const adminClient = useAdminClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [isRetiring, setIsRetiring] = useState(false);
  const toast = useToast();
  const [retireEdition] = useMutation(retireEditionMutation, {
    client: adminClient,
  });

  const handleRetireEdition = async () => {
    setIsRetiring(true);
    const payload = {
      variables: {
        input: {
          flowID: editionFlowId,
          editionID: editionId,
          idempotencyKey: uuidv4(),
        },
      },
    };
    try {
      const { errors, data } = await retireEdition(payload);
      setIsRetiring(false);
      if (errors) {
        throw new Error(errors?.[0]?.message);
      }
      if (!data?.retireEdition?.success) {
        throw new Error('The retire edition mutation fails.');
      }
      toast({
        title: 'Success.',
        description: `The edition is retired successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      router.push(collectionsDetail(collectionId));
    } catch (e) {
      toast({
        title: 'Error',
        description: `Retire Edition Error: ${e.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(`Retire Edition Error: ${e.message}`, {
        errorMessage: e.message,
        source: 'handleRetireEdition',
      });
      setIsRetiring(false);
    }
  };

  const retireEditionButtonProps = {
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
          {...retireEditionButtonProps}
          leftIcon={<HiX />}
          disabled={!editionFlowId || !editionId}
          onClick={onOpen}
        >
          Retire Edition
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
              <Text fontSize={20}>Confirm to retire this edition?</Text>
            </Flex>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} isLoading={isRetiring}>
              Cancel
            </Button>
            <Button
              color="black"
              backgroundColor="users.purple"
              ml={3}
              onClick={handleRetireEdition}
              isLoading={isRetiring}
              disabled={!editionFlowId || !editionId}
            >
              Retire Edition!
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};
