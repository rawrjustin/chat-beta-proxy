import React, { ReactElement } from 'react';
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
} from 'src/theme';

interface Props {
  isOpen: boolean;
  onClose(): void;
  alertHeader: string;
  children: ReactElement;
  footer?: ReactElement;
}

export const SimpleModal = ({
  isOpen,
  onClose,
  alertHeader,
  children,
  footer,
}: Props) => {
  const cancelRef = React.useRef(null);

  return (
    <React.Fragment>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>{alertHeader}</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>{children}</AlertDialogBody>
          <AlertDialogFooter>{footer}</AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};
