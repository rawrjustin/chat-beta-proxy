import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
} from 'src/theme';

interface Props {
  isOpen: boolean;
  onClose(): void;
  children: React.ReactElement;
  modalHeader: string;
}

export const MintEditionModal = ({
  isOpen,
  onClose,
  children,
  modalHeader,
}: Props) => {
  return (
    <React.Fragment>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
        }}
        size="xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textStyle="modalHeader">{modalHeader}</ModalHeader>
          <ModalCloseButton />
          {children}
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};
