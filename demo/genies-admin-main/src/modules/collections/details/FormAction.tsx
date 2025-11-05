import React, { useState, Fragment, ChangeEvent } from 'react';
import { Collection } from '../CollectionType';
import { FieldConfig, getValueByConfig } from './CollectionDetailForm';
import {
  HStack,
  Button,
  ModalBody,
  ModalFooter,
  Input,
  Text,
  Textarea,
} from 'src/theme';
import { HiOutlinePencilAlt, HiOutlineClipboardCopy } from 'react-icons/hi';
import { EditModalContainer } from './EditModalContainer';
import { ConfirmActionModal } from './ConfirmActionModal';
import { useDisclosure, useClipboard, useToast } from 'src/theme';

interface Props {
  field: string;
  onClose(): void;
  hiddenActionRow(): void;
  newVal: string;
  handleNewValueChange(e: ChangeEvent<HTMLInputElement>): void;
  editReason: string;
  handleEditReasonChange(e: ChangeEvent<HTMLTextAreaElement>): void;
  onOpenConfirm(): void;
}

// Todo: Update FieldEdit Input based on different key
const FieldEditContent = ({
  field,
  onClose,
  hiddenActionRow,
  newVal,
  handleNewValueChange,
  editReason,
  handleEditReasonChange,
  onOpenConfirm,
}: Props) => {
  const isSubmitDisabled = newVal.length === 0 || editReason.length === 0;

  return (
    <Fragment>
      <ModalBody>
        <Text mb={2}>{`New ${field}`}</Text>
        <Input
          mb={2}
          type="text"
          placeholder={`Enter New ${field}`}
          value={newVal}
          onChange={handleNewValueChange}
        />
        <Text mb={2}>Reason for your edits</Text>
        <Textarea
          mb={2}
          placeholder="Enter Reason To Change here..."
          size="md"
          value={editReason}
          onChange={handleEditReasonChange}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          variant="ghost"
          mr={3}
          onClick={() => {
            onClose();
            hiddenActionRow();
          }}
        >
          Cancel
        </Button>
        <Button
          color="black"
          backgroundColor="users.purple"
          onClick={() => {
            onClose();
            setTimeout(() => {
              onOpenConfirm();
            }, 300);
          }}
          disabled={isSubmitDisabled}
        >
          Submit
        </Button>
      </ModalFooter>
    </Fragment>
  );
};

interface FormActionProps {
  data: Collection;
  fieldConfig: FieldConfig;
  hiddenActionRow(): void;
  updateData(
    id: string,
    field: string | string[],
    newData: string | object,
  ): void;
}

export const FormAction = ({
  data,
  fieldConfig,
  hiddenActionRow,
  updateData,
}: FormActionProps) => {
  // Control Modal Open
  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();
  // Control Confirmation dialog open
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  // The input for the new val
  const [newVal, setNewVal] = useState<string>('');
  // The input for the change reason
  const [editReason, setEditReason] = useState<string>('');

  const onOpenConfirmDialog = () => setIsConfirmOpen(true);
  const onCloseConfirmDialog = () => setIsConfirmOpen(false);

  const handleNewValueChange = (e: ChangeEvent<HTMLInputElement>) =>
    setNewVal(e.target.value);
  const handleEditReasonChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setEditReason(e.target.value);

  // copy functionality
  const { onCopy } = useClipboard(getValueByConfig(data, fieldConfig));
  const toast = useToast();
  const onCopyField = () => {
    onCopy();
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <HStack>
      <Button
        size="md"
        color="users.purple"
        variant="ghost"
        leftIcon={<HiOutlinePencilAlt />}
        onClick={onOpenModal}
      >
        Edit
      </Button>
      <Button
        size="md"
        color="users.purple"
        variant="ghost"
        leftIcon={<HiOutlineClipboardCopy />}
        onClick={onCopyField}
      >
        Copy
      </Button>
      <EditModalContainer
        isOpen={isModalOpen}
        onClose={onCloseModal}
        field={fieldConfig.label}
        hiddenActionRow={hiddenActionRow}
      >
        <FieldEditContent
          field={fieldConfig.label}
          onClose={onCloseModal}
          hiddenActionRow={hiddenActionRow}
          newVal={newVal}
          editReason={editReason}
          handleNewValueChange={handleNewValueChange}
          handleEditReasonChange={handleEditReasonChange}
          onOpenConfirm={onOpenConfirmDialog}
        />
      </EditModalContainer>
      <ConfirmActionModal
        onOpenEditModal={onOpenModal}
        isOpen={isConfirmOpen}
        onClose={onCloseConfirmDialog}
        fieldConfig={fieldConfig}
        oldData={getValueByConfig(data, fieldConfig)}
        newData={newVal}
        hiddenActionRow={hiddenActionRow}
        updateData={(fieldKey, newValue) =>
          updateData(data.id, fieldKey, newValue)
        }
      />
    </HStack>
  );
};
