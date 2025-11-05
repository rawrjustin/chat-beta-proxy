import React, {
  useState,
  useEffect,
  useRef,
  SetStateAction,
  Dispatch,
} from 'react';
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
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { upsertDraftEditionMutation } from 'src/edge/gql/admin/upsertDraftEdition';
import { updateEditionMutation } from 'src/edge/gql/admin/updateEditionMutation';
import Logger from 'shared/logger';
import { NewEditionProps } from '../Edition/CreateEditionContainer';
import { EditionType } from 'src/edge/__generated/types/admin/globalTypes';
import callMobileCms from 'src/edge/mobilecms/callMobileCms';
import { generateImageInput } from './PublishEditionAction';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { editionDetails } from '../routes';

export const SaveDraftEditionAction = ({
  newEditionInfo,
  imageFile,
  draftEditionID,
  setDraftEditionID,
  collectionFlowId,
  collectionName,
  refetch,
}: {
  newEditionInfo: NewEditionProps;
  imageFile: File;
  draftEditionID?: string;
  setDraftEditionID?: Dispatch<SetStateAction<string>>;
  collectionFlowId;
  collectionName: string;
  refetch?: () => {};
}) => {
  const router = useRouter();
  const adminClient = useAdminClient();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [creatingEdition, setCreatingEdition] = useState(false);
  const [guid, setGuid] = useState(null);
  const [saveDraftEdition] = useMutation(upsertDraftEditionMutation, {
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

  const handleSaveDraftEdition = async () => {
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
      // Step 3: upload the image asset
      let imageUrlList = [];
      if (imageFile) {
        imageUrlList = await handleUploadImage();
        if (!imageUrlList || imageUrlList.length === 0) {
          throw new Error('No image url is returned from server');
        }
      }
      // Step 4: save or update draft
      let payload = {
        variables: {
          input: {
            name: newEditionInfo.name,
            collectionFlowID: Number(collectionFlowId),
            onchainMetadata: {
              rarity: newEditionInfo.rarity,
              type: EditionType.EDITION_TYPE_AVATAR_WEARABLE,
              designSlot: newEditionInfo.designSlot,
              publisher: newEditionInfo.publisher,
              avatarWearableSKU: guid || newEditionInfo.avatarWearableSKU,
            },
            editionID: draftEditionID,
          },
        },
      };
      const { errors: saveDraftEditionErrors, data } = await saveDraftEdition(
        payload,
      );
      if (saveDraftEditionErrors) {
        throw new Error(
          `Save Draft Edition Error: ${saveDraftEditionErrors[0].message}`,
        );
      }
      const editionID = data?.upsertEdition?.editionID || '';
      if (isCreateEditionPage) {
        setDraftEditionID(editionID);
      }
      // Step 5: update the edition with the off chian data
      let updateEditionPayload = {
        variables: {
          input: {
            editionID: editionID,
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
      const { errors: updateCollectionError } = await updateEdition(
        updateEditionPayload,
      );
      if (updateCollectionError) {
        throw new Error(
          `Update Edition Error: ${updateCollectionError[0].message}`,
        );
      }
      toast({
        title: 'Success.',
        description: `The draft edition was saved successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      onClose();
      setCreatingEdition(false);
      if (isCreateEditionPage) {
        router.push(editionDetails(editionID));
      } else {
        if (refetch) refetch();
      }
    } catch (e) {
      toast({
        title: 'Error',
        description: `Save Draft Edition error: ${e.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(`Save Draft error: ${e.message}`, {
        errorMessage: e.message,
        source: 'handleDraftEdition',
      });
      setCreatingEdition(false);
    }
  };

  const saveDraftEditionProps = {
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

  const enableSaveDraftButton =
    newEditionInfo.name?.length > 0 &&
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
    avatarWearableSKU: guid || newEditionInfo.avatarWearableSKU,
    'Collection Name': collectionName,
    ...(imageFile?.name && { 'Image Zip File': imageFile?.name }),
  };

  return (
    <React.Fragment>
      <Link style={{ textDecoration: 'none' }}>
        <Tooltip
          hasArrow
          isDisabled={enableSaveDraftButton}
          label="missing required field(s)"
        >
          <Button
            size="lg"
            w="200px"
            variant="solid"
            isDisabled={!enableSaveDraftButton}
            fontWeight={400}
            {...saveDraftEditionProps}
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
              onClick={handleSaveDraftEdition}
              isLoading={creatingEdition}
            >
              Save Draft!
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};
