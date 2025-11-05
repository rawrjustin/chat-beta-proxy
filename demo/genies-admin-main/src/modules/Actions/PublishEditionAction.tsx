import React, { useState, useEffect, useRef } from 'react';
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
import { addEditionMutation } from 'src/edge/gql/admin/addEditionMutation';
import Logger from 'shared/logger';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { editionDetails } from 'src/modules/routes';
import { NewEditionProps } from '../Edition/CreateEditionContainer';
import { EditionType } from 'src/edge/__generated/types/admin/globalTypes';
import axios from 'axios';
import { EditionImageType } from 'src/edge/__generated/types/admin/globalTypes';
import { updateEditionMutation } from 'src/edge/gql/admin/updateEditionMutation';
import callMobileCms from 'src/edge/mobilecms/callMobileCms';
import { searchEditionsQuery } from 'src/edge/gql/admin/searchEditionsQuery';

const IMAGE_URL_TYPE_MAPPING = {
  [EditionImageType.EDITION_IMAGE_TYPE_CONTAINER]: '/wearable-container.',
  [EditionImageType.EDITION_IMAGE_TYPE_HERO]: '/wearable-hero.',
  [EditionImageType.EDITION_IMAGE_TYPE_MANNEQUIN_FULL]: '/mannequin-1.',
  [EditionImageType.EDITION_IMAGE_TYPE_MANNEQUIN_ZOOM]: '/mannequin-2.',
  [EditionImageType.EDITION_IMAGE_TYPE_WEARABLE]: '/wearable.',
};

export const generateImageInput = (urlList: string[]) => {
  const res = [];
  urlList.forEach((url) => {
    let type: string = EditionImageType.EDITION_IMAGE_TYPE_NIL;
    Object.keys(IMAGE_URL_TYPE_MAPPING).forEach((key) => {
      if (url.includes(IMAGE_URL_TYPE_MAPPING[key])) {
        type = key;
      }
      return;
    });
    res.push({ type, url });
  });
  return res;
};

export const PublishEditionAction = ({
  newEditionInfo,
  imageFile,
  draftEditionID,
  collectionFlowId,
  collectionName,
}: {
  newEditionInfo: NewEditionProps;
  imageFile: File;
  draftEditionID?: string;
  collectionFlowId: number;
  collectionName: string;
}) => {
  const router = useRouter();
  const adminClient = useAdminClient();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [guid, setGuid] = useState(null);
  const [creatingEdition, setCreatingEdition] = useState(false);
  const [addEdition] = useMutation(addEditionMutation, {
    client: adminClient,
  });
  const [updateEdition] = useMutation(updateEditionMutation, {
    client: adminClient,
  });
  const [isFetchingGui, setIsFetchingGui] = useState(false);
  const isCreateEditionPage = !draftEditionID;

  useEffect(() => {
    const fetchEditionAssetGuid = async () => {
      if (!imageFile) {
        return;
      }
      const assetAddress = imageFile.name.substring(
        0,
        imageFile.name.indexOf('.zip'),
      );
      setIsFetchingGui(true);
      const res = await callMobileCms({ assetAddress });
      setIsFetchingGui(false);
      if (res?.length) {
        setGuid(res[0].guid);
      } else {
        setGuid(null);
      }
    };
    fetchEditionAssetGuid();
  }, [imageFile]);

  const handleUploadImage = async () => {
    if (!imageFile) {
      throw new Error('No Image Zip file is selected');
    }
    try {
      const res = await axios.post(`/api/upload`, imageFile, {
        headers: {
          'content-type': imageFile.type,
          'x-filename': imageFile.name,
          'x-filetype': imageFile.type,
          'x-collection-name': collectionName,
          'x-guid': guid,
        },
      });
      if (res.status === 200) {
        toast({
          title: 'Success.',
          description: `The image has been updated successfully`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return res?.data;
      } else {
        throw new Error(`Upload Image error: Response Status ${res.status}`);
      }
    } catch (e) {
      throw new Error(`Upload Image error: ${e.message}`);
    }
  };

  const handleAddEdition = async () => {
    try {
      setCreatingEdition(true);
      // Step 1: verify the collection name
      if (!collectionName || collectionName?.length === 0) {
        throw new Error('No Collection name is found!');
      }
      // Step 2: verify the avatarWearableSKU(guid)
      if (!newEditionInfo.avatarWearableSKU && (!guid || guid?.length === 0)) {
        throw new Error('No Edition Asset Guid is found!');
      }
      // Step 3: upload the image asset (only allowed in create-edition page)
      let imageUrlList = [];
      if (imageFile) {
        imageUrlList = await handleUploadImage();
        if (!imageUrlList || imageUrlList.length === 0) {
          throw new Error('No image url is returned from server');
        }
      }
      // Step 4: add edition (On chain meta data)
      const payload = {
        variables: {
          input: {
            name: newEditionInfo.name,
            collectionFlowID: collectionFlowId,
            onchainMetadata: {
              rarity: newEditionInfo.rarity,
              type: EditionType.EDITION_TYPE_AVATAR_WEARABLE,
              designSlot: newEditionInfo.designSlot,
              publisher: newEditionInfo.publisher,
              avatarWearableSKU: guid || newEditionInfo.avatarWearableSKU,
            },
          },
        },
      };
      if (draftEditionID) {
        payload.variables.input['editionID'] = draftEditionID;
      }
      const { errors: addEditionErrors, data } = await addEdition(payload);
      if (addEditionErrors) {
        throw new Error(addEditionErrors[0].message);
      }
      const editionFlowId = data?.addEdition?.flowID;
      // Step 5: watch the query to get the edition ID
      const querySubscription = adminClient
        .watchQuery({
          query: searchEditionsQuery,
          pollInterval: 500,
          variables: {
            searchInput: {
              filters: {
                byFlowIDs: [Number(editionFlowId)],
                byCollectionFlowIDs: [],
                byDropIDs: [],
                byIDs: [],
              },
            },
          },
        })
        .subscribe({
          next: async ({ data }) => {
            if (data?.searchEditions?.editions?.length) {
              //stop polling searchEditions query
              querySubscription.unsubscribe();
              // Step 6: update the editon with the off chian data
              const editionId = data?.searchEditions?.editions?.[0].id;
              let payload = {
                variables: {
                  input: {
                    editionID: editionId,
                    offchainMetadata: {
                      description: newEditionInfo.description,
                      images:
                        imageUrlList.length > 0
                          ? generateImageInput(imageUrlList)
                          : newEditionInfo.images,
                    },
                    idempotencyKey: uuidv4(),
                  },
                },
              };
              const { errors: updateEditionError } = await updateEdition(
                payload,
              );
              if (updateEditionError) {
                throw new Error(
                  `Update Edition Error: ${updateEditionError[0].message}`,
                );
              }
              toast({
                title: 'Success.',
                description: `The edition was created successfully`,
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top',
              });
              onClose();
              setCreatingEdition(false);
              router.push(editionDetails(editionId));
            }
          },
          error: (e) => {
            Logger.getInstance().error(`Watch Edition: ${e.message}`, {
              errorMessage: e.message,
              source: 'watchQuery: searchEditionsQuery',
            });
          },
        });
    } catch (e) {
      toast({
        title: 'Error',
        description: `Add Edition error: ${e.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(`Add Edition error: ${e.message}`, {
        errorMessage: e.message,
        source: 'handleAddEdition',
      });
      setCreatingEdition(false);
    }
  };

  const publishEditionProps = {
    fontFamily: 'Roobert Regular',
    color: 'white',
    backgroundColor: 'users.purple',
    _selected: { backgroundColor: 'green.200', color: 'white' },
    _hover: { color: 'white', backgroundColor: 'green.200' },
  };

  let hasValidGui = true;
  if (isCreateEditionPage) {
    hasValidGui = !!imageFile && guid;
  } else {
    hasValidGui = !!imageFile ? guid : true;
  }

  const enablePublishButton =
    newEditionInfo.name?.length > 0 &&
    newEditionInfo.description?.length > 0 &&
    newEditionInfo.publisher?.length > 0 &&
    !!newEditionInfo?.rarity &&
    !!newEditionInfo.designSlot &&
    !isFetchingGui &&
    hasValidGui;

  const allNewEditionInformation = {
    name: newEditionInfo.name,
    description: newEditionInfo.description,
    publisher: newEditionInfo.publisher,
    rarity: newEditionInfo.rarity,
    designSlot: newEditionInfo.designSlot,
    avatarWearableSKU: newEditionInfo.avatarWearableSKU || guid,
    'Collection Name': collectionName,
    ...(imageFile?.name && { 'Image Zip File': imageFile?.name }),
  };

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
            {...publishEditionProps}
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
        <AlertDialogContent maxW="2xl">
          <AlertDialogHeader>Confirm The Following</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody width="max-content">
            <Flex direction="column" mt={4} mb={4}>
              {Object.keys(allNewEditionInformation).map((key, idx) => (
                <Flex key={idx} justifyContent="space-between" minWidth="600px">
                  <Flex flex={2}>
                    <Text fontSize={20}>
                      <b>{key.charAt(0).toUpperCase() + key.slice(1)}</b>:
                    </Text>
                  </Flex>
                  <Flex flex={3}>
                    <Text
                      fontSize={20}
                    >{`${allNewEditionInformation[key]}`}</Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              isLoading={creatingEdition}
            >
              Cancel
            </Button>
            <Button
              color="black"
              backgroundColor="users.purple"
              ml={3}
              onClick={handleAddEdition}
              isLoading={creatingEdition}
            >
              Publish!
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};
