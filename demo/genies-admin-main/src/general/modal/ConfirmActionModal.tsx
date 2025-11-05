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
import { FormatUTCToPDT } from '../components/DateTime';
import Logger from 'shared/logger';

interface Props {
  onOpenEditModal(): void;
  isOpen: boolean;
  fieldConfig: FieldConfig;
  onClose(): void;
  oldData: string | number;
  newData: string;
  editReason: string;
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
  editReason,
  hiddenActionRow,
  updateData,
}: Props) => {
  const cancelRef = React.useRef(null);
  const toast = useToast();

  async function handleSubmit() {
    try {
      await updateData(fieldConfig.key, newData);
      hiddenActionRow();
      toast({
        title: 'Success.',
        description: `${fieldConfig.label} has been updated`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().info(`Submit Edit success: ${fieldConfig.label}`, {
        oldData,
        newData,
        editReason,
        source: 'ConfirmActionModal: handleSubmit',
      });
    } catch (e) {
      toast({
        title: 'Error.',
        description: `Something went wrong. Please try again. ${e}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(`Submit Edit failed: ${fieldConfig.label}`, {
        errorMessage: e.message,
        oldData,
        newData,
        editReason,
        source: 'ConfirmActionModal: handleSubmit',
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
          {fieldConfig.key === 'startTime' || fieldConfig.key === 'endTime' ? (
            <AlertDialogBody>
              {`You're changing ${fieldConfig.label} from`}
              <br />
              <FormatUTCToPDT date={oldData as string} isBold={true} />
              to
              <br />
              {/**Because the timezone is already in PDT, isPDT is set to true */}
              <FormatUTCToPDT
                date={newData as string}
                isBold={true}
                isPDT={true}
              />
            </AlertDialogBody>
          ) : (
            <AlertDialogBody>
              {`You're changing ${fieldConfig.label} from`}
              <Text fontWeight={800}>{oldData}</Text> to{' '}
              <Text fontWeight={800}>{newData}</Text>
            </AlertDialogBody>
          )}
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
