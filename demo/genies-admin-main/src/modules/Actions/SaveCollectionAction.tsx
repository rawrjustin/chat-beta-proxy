import React, { useState, useRef } from 'react';
import {
  Button,
  Link,
  Tooltip,
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
import { HiOutlineSave } from 'react-icons/hi';
import { useMutation } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import Logger from 'shared/logger';
import { NewCollectionProps } from '../collections/create/CreateCollectionContainer';
import { upsertCollectionMutation } from 'src/edge/gql/admin/upsertCollectionMutation';
import { useRouter } from 'next/router';
import { collectionsDetail } from '../routes';

export const SaveCollectionAction = ({
  draftCollectionInfo,
  draftCollectionID,
}: {
  draftCollectionInfo: NewCollectionProps;
  draftCollectionID?: string;
}) => {
  const router = useRouter();
  const adminClient = useAdminClient();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [creatingCollection, setCreatingCollection] = useState(false);

  const [upsertCollection] = useMutation(upsertCollectionMutation, {
    client: adminClient,
  });

  const isCreateCollectionPage = !draftCollectionID;

  const handleSubmitSaveCollection = async () => {
    setCreatingCollection(true);

    let payload = {
      variables: {
        input: {
          name: draftCollectionInfo.title,
          seriesFlowID: draftCollectionInfo.seriesFlowID,
          description: draftCollectionInfo.description,
          collectionID: draftCollectionID,
        },
      },
    };

    const { data, errors: upsertCollectionErrors } = await upsertCollection(
      payload,
    );

    if (upsertCollectionErrors) {
      toast({
        title: 'Error',
        description: `Draft Collection error: ${upsertCollectionErrors[0].message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(
        `UpsertCollection error: ${upsertCollectionErrors[0].message}`,
        {
          errorMessage: upsertCollectionErrors[0].message,
          source: 'SaveCollectionAction',
        },
      );
    } else {
      const draftCollectionID = data?.upsertCollection?.collectionID;
      toast({
        title: 'Success.',
        description: `The draft was saved`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      onClose();
      if (isCreateCollectionPage) {
        router.push(collectionsDetail(draftCollectionID));
      }
    }
  };

  const saveCollectionProps = {
    fontFamily: 'Roobert Regular',
    color: 'white',
    backgroundColor: 'users.purple',
    _selected: { backgroundColor: 'green.200', color: 'white' },
    _hover: { color: 'white', backgroundColor: 'green.200' },
  };

  const enableSaveButton =
    draftCollectionInfo.title?.length > 0 &&
    draftCollectionInfo.description?.length > 0 &&
    draftCollectionInfo.seriesFlowID !== null;

  return (
    <React.Fragment>
      <Link style={{ textDecoration: 'none' }}>
        <Tooltip
          hasArrow
          isDisabled={enableSaveButton}
          label="missing required field(s)"
        >
          <Button
            size="lg"
            w="200px"
            variant="solid"
            isDisabled={!enableSaveButton}
            fontWeight={400}
            {...saveCollectionProps}
            leftIcon={<HiOutlineSave />}
            onClick={onOpen}
          >
            Save Draft
          </Button>
        </Tooltip>
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
        <AlertDialogContent>
          <AlertDialogHeader>Confirm The Following</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            <Flex direction="column" mt={4} mb={4}>
              {Object.keys(draftCollectionInfo).map((key, idx) => (
                <Flex key={idx} justifyContent="space-between">
                  <Flex w="full" flex={1}>
                    <Text fontSize={20}>
                      <b>{`${key}`}</b>:
                    </Text>
                  </Flex>
                  <Flex w="full" flex={1}>
                    <Text fontSize={20}>{`${draftCollectionInfo[key]}`}</Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              isLoading={creatingCollection}
            >
              Cancel
            </Button>
            <Button
              color="black"
              backgroundColor="users.purple"
              ml={3}
              onClick={handleSubmitSaveCollection}
              isLoading={creatingCollection}
            >
              Save Draft!
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};
