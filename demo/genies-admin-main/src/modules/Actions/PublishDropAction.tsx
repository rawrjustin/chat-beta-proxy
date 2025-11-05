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
  Image,
  useDisclosure,
  useToast,
} from 'src/theme';
import { HiUpload } from 'react-icons/hi';
import {
  NewDropProps,
  EditionOption,
} from '../drops/create/CreateDropContainer';
import { useMutation } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { upsertDropMutation } from 'src/edge/gql/admin/upsertDropMutation';
import axios from 'axios';
import Logger from 'shared/logger';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { drops } from 'src/modules/routes';
import { formatPDTToUTC } from 'src/general/components/DateTime';

export const PublishDropAction = ({
  newDropInfo,
  imageFile,
  editionPrice,
  selectedEdition,
}: {
  newDropInfo: NewDropProps;
  imageFile: File;
  editionPrice: { [key: string]: number };
  selectedEdition: EditionOption[];
}) => {
  const router = useRouter();
  const adminClient = useAdminClient();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [reader] = useState<FileReader>(() => new FileReader());
  const [imageContent, setImageContent] = useState(null);
  const [creatingDrop, setCreatingDrop] = useState(false);
  const [upsertDrop] = useMutation(upsertDropMutation, {
    client: adminClient,
  });

  useEffect(() => {
    reader.addEventListener('load', (event) => {
      setImageContent(event.target.result);
    });
    if (imageFile) reader.readAsDataURL(imageFile);
  }, [imageFile, reader]);

  const handleUploadImage = async () => {
    if (!imageFile) {
      toast({
        title: 'Error',
        description: `Please select image first!`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    const imageName = newDropInfo.title
      .trim()
      .toLowerCase()
      .replaceAll(' ', '_');
    const imageType = imageFile.type.substring(imageFile.type.indexOf('/') + 1);
    try {
      const res = await axios.post(`/api/upload`, imageFile, {
        headers: {
          'content-type': imageFile.type,
          'x-filename': `${imageName}.${imageType}`,
          'x-filetype': imageFile.type,
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
        return res.data.url;
      } else {
        toast({
          title: 'Error',
          description: `Upload Image error: Response Status ${res.status}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return null;
      }
    } catch (e) {
      toast({
        title: 'Error',
        description: `Upload Image error: ${e.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(`Upload Image error: ${e.message}`, {
        errorMessage: e.message,
        source: 'handleUploadImage',
      });
    }
  };

  const handleSubmitUpsertDrop = async () => {
    setCreatingDrop(true);

    const imageUrl = await handleUploadImage();
    if (!imageUrl) {
      setCreatingDrop(false);
      return;
    }

    const dropEditionPrice = selectedEdition.map((edition) => {
      return {
        editionID: edition.value,
        dropPrice: editionPrice[edition.value].toString(),
      };
    });
    let payload = {
      variables: {
        input: {
          ...newDropInfo,
          startTime: formatPDTToUTC(newDropInfo.startTime),
          endTime: formatPDTToUTC(newDropInfo.endTime),
          imageURL: imageUrl,
          dropEditionPrices: dropEditionPrice,
          idempotencyKey: uuidv4(),
        },
      },
    };

    const { errors: upsertDropErrors } = await upsertDrop(payload);
    setCreatingDrop(false);
    if (upsertDropErrors) {
      toast({
        title: 'Error',
        description: `Create Drop error: ${upsertDropErrors[0].message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(
        `Upsert Drop error: ${upsertDropErrors[0].message}`,
        {
          errorMessage: upsertDropErrors[0].message,
          source: 'handleSubmitUpsertDrop',
        },
      );
    } else {
      toast({
        title: 'Success.',
        description: `The Drop was created successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      onClose();
      router.push(drops());
    }
  };

  const publishDropProps = {
    fontFamily: 'Roobert Regular',
    color: 'white',
    backgroundColor: 'users.purple',
    _selected: { backgroundColor: 'green.200', color: 'white' },
    _hover: { color: 'white', backgroundColor: 'green.200' },
  };

  const isAllEditionPriceValid =
    selectedEdition.length > 0 &&
    Object.values(editionPrice).filter((v) => v > 0).length ===
      selectedEdition.length;

  const enablePublishButton =
    isAllEditionPriceValid &&
    newDropInfo.title.length > 0 &&
    newDropInfo.description.length > 0 &&
    newDropInfo.startTime.length > 0 &&
    newDropInfo.endTime.length > 0 &&
    !!imageFile;

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
            {...publishDropProps}
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
              <Flex justifyContent="center" mb={8}>
                {imageContent && (
                  <Image w="40" h="40" src={imageContent} alt="" />
                )}
              </Flex>
              {Object.keys(newDropInfo).map((key, idx) => (
                <Flex key={idx} justifyContent="space-between">
                  <Flex w="full" flex={1}>
                    <Text fontSize={20}>
                      <b>{`${key}`}</b>:
                    </Text>
                  </Flex>
                  <Flex w="full" flex={1}>
                    <Text fontSize={20}>{`${newDropInfo[key]}`}</Text>
                  </Flex>
                </Flex>
              ))}
              <Flex justifyContent="space-between" mt={10}>
                <Flex justifyContent="center" w="full" flex={1}>
                  <Text fontSize={20}>Editions</Text>
                </Flex>
                <Flex justifyContent="center" w="full" flex={1}>
                  <Text fontSize={20}>Price</Text>
                </Flex>
              </Flex>
              {selectedEdition.map((edition, idx) => {
                return (
                  <Flex key={idx} justifyContent="space-between" mt={4}>
                    <Flex alignItems="center" justifyContent="center" flex={1}>
                      <Image
                        w="10"
                        h="10"
                        src={
                          edition.imageUrl
                            ? edition.imageUrl
                            : '/static/images/transparentbox.svg'
                        }
                        alt=""
                      />
                      <Text ml={4}>{edition.label}</Text>
                    </Flex>
                    <Flex mr={4} justifyContent="center" flex={1}>
                      <Text ml={4}>{editionPrice[edition.value]}</Text>
                    </Flex>
                  </Flex>
                );
              })}
            </Flex>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} isLoading={creatingDrop}>
              Cancel
            </Button>
            <Button
              color="black"
              backgroundColor="users.purple"
              ml={3}
              onClick={handleSubmitUpsertDrop}
              isLoading={creatingDrop}
            >
              Publish!
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};
