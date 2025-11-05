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
import { HiUpload } from 'react-icons/hi';
import { useMutation } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import Logger from 'shared/logger';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { NewCollectionProps } from '../collections/create/CreateCollectionContainer';
import { addCollectionMutation } from 'src/edge/gql/admin/addCollectionMutation';
import { collectionsDetail } from '../routes/routes';
import { searchCollectionsQuery } from 'src/edge/gql/admin/searchCollectionsQuery';
import { updateCollectionMutation } from 'src/edge/gql/admin/updateCollectionMutation';

export const PublishCollectionAction = ({
  newCollectionInfo,
  collectionId,
}: {
  newCollectionInfo: NewCollectionProps;
  collectionId?: string;
}) => {
  const router = useRouter();
  const adminClient = useAdminClient();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [creatingCollection, setCreatingCollection] = useState(false);

  const [addCollection] = useMutation(addCollectionMutation, {
    client: adminClient,
  });

  const [updateCollection] = useMutation(updateCollectionMutation, {
    client: adminClient,
  });

  const handleSubmitAddCollection = async () => {
    try {
      setCreatingCollection(true);

      // step 1: add collection with on chain meta data
      let payload = {
        variables: {
          input: {
            name: newCollectionInfo.title,
            seriesFlowID: newCollectionInfo.seriesFlowID,
          },
        },
      };
      if (collectionId) {
        payload.variables.input['collectionID'] = collectionId;
      }
      const { data, errors: addCollectionErrors } = await addCollection(
        payload,
      );
      if (addCollectionErrors) {
        throw new Error(addCollectionErrors[0].message);
      }
      const collectionFlowID = data.addCollection?.flowID;
      // step 2: watch the query to get collection ID
      const querySubscription = adminClient
        .watchQuery({
          query: searchCollectionsQuery,
          pollInterval: 500,
          variables: {
            searchInput: {
              filters: {
                byFlowIDs: [Number(collectionFlowID)],
                byCreatorIDs: [],
              },
              pageSize: 1,
            },
          },
        })
        .subscribe({
          next: async ({ data }) => {
            if (data?.searchCollections?.collections?.length > 0) {
              //stop polling searchCollections query
              querySubscription.unsubscribe();
              // step 3: update collection with off chain data
              const collectionID = data?.searchCollections?.collections[0]?.id;
              let payload = {
                variables: {
                  input: {
                    id: collectionID,
                    metadata: {
                      description: newCollectionInfo.description,
                    },
                    idempotencyKey: uuidv4(),
                  },
                },
              };
              const { errors: updateCollectionError } = await updateCollection(
                payload,
              );
              if (updateCollectionError) {
                throw new Error(
                  `Update Collection Error: ${updateCollectionError[0].message}`,
                );
              }
              toast({
                title: 'Success.',
                description: `The collection was created successfully`,
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top',
              });
              onClose();
              setCreatingCollection(false);
              router.push(collectionsDetail(collectionID));
            }
          },
          error: (e) => {
            Logger.getInstance().error(`Watch Collection: ${e.message}`, {
              errorMessage: e,
              source: 'watchQuery: searchCollectionsQuery',
            });
          },
        });
    } catch (e) {
      toast({
        title: 'Error',
        description: `Add Collection error: ${e.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(`Add Collection error: ${e.message}`, {
        errorMessage: e.message,
        source: 'handleSubmitAddCollection',
      });
      setCreatingCollection(false);
    }
  };

  const publishCollectionProps = {
    fontFamily: 'Roobert Regular',
    color: 'white',
    backgroundColor: 'users.purple',
    _selected: { backgroundColor: 'green.200', color: 'white' },
    _hover: { color: 'white', backgroundColor: 'green.200' },
  };

  const enablePublishButton =
    newCollectionInfo.title?.length > 0 &&
    newCollectionInfo.description?.length > 0 &&
    newCollectionInfo.seriesFlowID !== null;

  return (
    <React.Fragment>
      <Link style={{ textDecoration: 'none' }}>
        <Tooltip
          hasArrow
          isDisabled={enablePublishButton}
          label="missing required field(s)"
        >
          <Button
            size="lg"
            w="200px"
            variant="solid"
            isDisabled={!enablePublishButton}
            fontWeight={400}
            {...publishCollectionProps}
            leftIcon={<HiUpload />}
            onClick={onOpen}
          >
            Publish
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
              {Object.keys(newCollectionInfo).map((key, idx) => (
                <Flex key={idx} justifyContent="space-between">
                  <Flex w="full" flex={1}>
                    <Text fontSize={20}>
                      <b>{`${key}`}</b>:
                    </Text>
                  </Flex>
                  <Flex w="full" flex={1}>
                    <Text fontSize={20}>{`${newCollectionInfo[key]}`}</Text>
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
              onClick={handleSubmitAddCollection}
              isLoading={creatingCollection}
            >
              Publish!
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};
