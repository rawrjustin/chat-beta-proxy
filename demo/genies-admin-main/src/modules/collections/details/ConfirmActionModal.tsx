import React from 'react';
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Text,
  useToast,
} from 'src/theme';
import { FieldConfig } from 'src/modules/collections/details/CollectionDetailForm';

interface Props {
  onOpenEditModal(): void;
  isOpen: boolean;
  fieldConfig: FieldConfig;
  onClose(): void;
  oldData: string | number;
  newData: string;
  hiddenActionRow(): void;
  updateData(field: string | string[], newData: string): void;
}

export const ConfirmActionModal = ({
  onOpenEditModal,
  isOpen,
  onClose,
  fieldConfig,
  oldData,
  newData,
  hiddenActionRow,
  updateData,
}: Props) => {
  const cancelRef = React.useRef(null);
  const toast = useToast();

  function handleSubmit() {
    try {
      updateData(fieldConfig.key, newData);
      hiddenActionRow();
      toast({
        title: 'Success.',
        description: `${fieldConfig.label} has been updated`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } catch (e) {
      toast({
        title: 'Error.',
        description: `Something went wrong. Please try again.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
    onClose();
  }
  return (
    <React.Fragment>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={() => {
          onClose();
          onOpenEditModal();
        }}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Confirm Action</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            {`You're changing ${fieldConfig.label} from`}
            <Text fontWeight={800}>{oldData}</Text> to{' '}
            <Text fontWeight={800}>{newData}</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={() => {
                onClose();
                setTimeout(() => {
                  onOpenEditModal();
                }, 300);
              }}
            >
              No, Take me back!
            </Button>
            <Button
              color="black"
              backgroundColor="users.purple"
              ml={3}
              onClick={handleSubmit}
            >
              Yes, Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};
