import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Text,
} from 'src/theme';

interface Props {
  isOpen: boolean;
  onClose(): void;
  field: string;
  children: React.ReactElement;
  hiddenActionRow(): void;
}
// Todo: @jietang, merge it with /general/modal/EditModal to make it more general
export const EditModalContainer = ({
  isOpen,
  onClose,
  field,
  children,
  hiddenActionRow,
}: Props) => {
  return (
    <React.Fragment>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          hiddenActionRow();
        }}
        size="xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textStyle="modalHeader">{`Edit ${field}`}</ModalHeader>
          <Text ml={6} mt={0} mb={6}>
            Input relevant data and click on submit to publish the content.
          </Text>
          <ModalCloseButton />
          {children}
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};
