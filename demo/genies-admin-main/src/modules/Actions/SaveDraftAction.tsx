import React, { useState, useEffect } from 'react';
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
  useDisclosure,
} from 'src/theme';
import { HiOutlineSave } from 'react-icons/hi';
import { NewDropProps } from '../drops/create/CreateDropContainer';
import { createTabProps } from './CreateActions';

export const SaveDraftAction = (newDropInfo: NewDropProps) => {
  const [isDisabled, setIsDisabled] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  useEffect(() => {
    //@mountz TODO: add newDropInfo.editions as check when logic is implemented
    if (newDropInfo.title && newDropInfo.description) {
      setIsDisabled(false);
    } else {
      //need to check again incase input in a field was removed
      setIsDisabled(true);
    }
  }, [newDropInfo]);

  return (
    <React.Fragment>
      <Link style={{ textDecoration: 'none' }}>
        <Tooltip
          hasArrow
          isDisabled={!isDisabled}
          label="missing required field(s)"
        >
          <Button
            size="lg"
            w="200px"
            variant="outline"
            borderColor="users.purple"
            color="users.purple"
            fontWeight={400}
            {...createTabProps}
            isDisabled={isDisabled}
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
            {Object.keys(newDropInfo).map((key, idx) => (
              <Text key={idx}>
                <b>{`${key}`}</b>: {`${newDropInfo[key]}`}
              </Text>
            ))}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              color="black"
              backgroundColor="users.purple"
              ml={3}
              onClick={onClose}
            >
              Save Draft
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};
