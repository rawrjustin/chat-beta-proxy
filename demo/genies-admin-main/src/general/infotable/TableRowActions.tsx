import React, { useState, useEffect, Fragment, ChangeEvent } from 'react';
import {
  HStack,
  Button,
  ModalBody,
  ModalFooter,
  Text,
  Textarea,
  Input,
  InputGroup,
  InputLeftAddon,
} from 'src/theme';
import { HiOutlinePencilAlt, HiOutlineClipboardCopy } from 'react-icons/hi';
import CountryCodeInput from 'src/general/input/CountryCodeInput';
import { useDisclosure, useClipboard, useToast } from 'src/theme';
import { EditModal } from 'src/general/modal/EditModal';
import { ConfirmActionModal } from 'src/general/modal/ConfirmActionModal';
import {
  FieldConfig,
  getValueByConfig,
} from 'src/modules/collections/details/CollectionDetailForm';
import { format, utcToZonedTime } from 'date-fns-tz';
import { useConsumerClient } from 'src/lib/apollo/MultiApolloProvider';
import { fetchCreatorId } from 'src/modules/users/fetchCreatorId';

interface FieldEditContentProps {
  fieldLabel: string;
  onClose(): void;
  hiddenActionRow(): void;
  newVal: string;
  currentData: string;
  handleNewValueChange(e: ChangeEvent<HTMLInputElement>): void;
  editReason: string;
  handleEditReasonChange(e: ChangeEvent<HTMLTextAreaElement>): void;
  onOpenConfirm(): void;
}

const FieldEditContent = ({
  fieldLabel,
  onClose,
  hiddenActionRow,
  currentData,
  newVal,
  handleNewValueChange,
  editReason,
  handleEditReasonChange,
  onOpenConfirm,
}: FieldEditContentProps) => {
  const [error, setError] = useState<string>(undefined);
  const consumerClient = useConsumerClient();

  useEffect(() => {
    const validateData = async () => {
      if (newVal.length === 0) {
        setError('Please enter the new value!');
        return;
      }
      if (fieldLabel === 'Creator') {
        if (newVal.length < 4 || newVal.length > 20) {
          setError('The create name must be between 4 and 20 characters.');
          return;
        }
        if (!(await fetchCreatorId(consumerClient, newVal))) {
          setError('No creator is found!');
          return;
        }
      }
      if (editReason.length === 0) {
        setError('Please enter the editing reason!');
        return;
      }
      setError(undefined);
    };
    if (fieldLabel === 'Creator') {
      const delay = setTimeout(() => {
        validateData();
      }, 400);
      return () => clearTimeout(delay);
    } else {
      validateData();
    }
  }, [newVal, editReason, fieldLabel, consumerClient]);

  const isSubmitDisabled = error && error?.length > 0;

  let editField;

  switch (fieldLabel) {
    case 'Phone Number': {
      editField = (
        <InputGroup>
          <InputLeftAddon>
            <CountryCodeInput />
          </InputLeftAddon>
          <Input
            type="tel"
            placeholder={currentData}
            value={newVal}
            onChange={handleNewValueChange}
          />
        </InputGroup>
      );
      break;
    }
    case 'Start Time': {
      editField = (
        <Input
          mb={2}
          type="datetime-local"
          placeholder={`Enter New ${fieldLabel}`}
          value={newVal}
          onChange={handleNewValueChange}
        />
      );
      break;
    }
    case 'End Time': {
      editField = (
        <Input
          mb={2}
          type="datetime-local"
          placeholder={`Enter New ${fieldLabel}`}
          value={newVal}
          onChange={handleNewValueChange}
        />
      );
      break;
    }
    default: {
      editField = (
        <Input
          mb={2}
          type="text"
          placeholder={currentData}
          value={newVal}
          onChange={handleNewValueChange}
        />
      );
      break;
    }
  }

  return (
    <Fragment>
      <ModalBody>
        <Text mb={2}>{`New ${fieldLabel}`}</Text>
        {editField}
        <Text mb={2}>Reason for your edits</Text>
        <Textarea
          mb={2}
          placeholder="Enter Reason To Change here..."
          size="md"
          value={editReason}
          onChange={handleEditReasonChange}
        />
        {error && (
          <Text mb={2} textColor="red">
            {error}
          </Text>
        )}
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

interface Props {
  data: { [key: string]: any };
  fieldConfig: FieldConfig;
  hiddenActionRow(): void;
  updateData(
    id: string,
    field: string | string[],
    newData: string | object,
  ): void;
  copyEnabled?: boolean;
}

export const TableRowActions = ({
  data,
  updateData,
  hiddenActionRow,
  fieldConfig,
  copyEnabled = true,
}: Props) => {
  // Control Modal Open
  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();

  // Control Confirmation dialog open
  const {
    onOpen: onOpenConfirm,
    isOpen: isConfirmOpen,
    onClose: onCloseConfirm,
  } = useDisclosure();

  //converts UTC date to formatted PDT time
  const convertUTC = (UTCDate) => {
    const pattern = "yyyy-MM-dd'T'HH:mm:ss";
    return format(utcToZonedTime(UTCDate, 'America/Los_Angeles'), pattern);
  };

  //input for the new value - initialized to be the current value of the field
  //if field is start/end time, format UTC string to be in PDT time zone
  const [newVal, setNewVal] = React.useState<string>(
    fieldConfig.key === 'startTime' || fieldConfig.key === 'endTime'
      ? convertUTC(getValueByConfig(data, fieldConfig))
      : getValueByConfig(data, fieldConfig),
  );
  //input for the change reason
  const [editReason, setEditReason] = React.useState<string>('');

  const handleNewValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewVal(e.target.value);
  };

  const handleEditReasonChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => setEditReason(e.target.value);

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
    <React.Fragment>
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
        {copyEnabled && (
          <Button
            size="md"
            color="users.purple"
            variant="ghost"
            leftIcon={<HiOutlineClipboardCopy />}
            onClick={onCopyField}
          >
            Copy
          </Button>
        )}
      </HStack>
      <EditModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        hiddenActionRow={hiddenActionRow}
        fieldLabel={fieldConfig.label}
      >
        <FieldEditContent
          fieldLabel={fieldConfig.label}
          onClose={onCloseModal}
          hiddenActionRow={hiddenActionRow}
          newVal={newVal}
          currentData={getValueByConfig(data, fieldConfig)}
          editReason={editReason}
          handleNewValueChange={handleNewValueChange}
          handleEditReasonChange={handleEditReasonChange}
          onOpenConfirm={onOpenConfirm}
        />
      </EditModal>
      <ConfirmActionModal
        onOpenEditModal={onOpenModal}
        isOpen={isConfirmOpen}
        onClose={onCloseConfirm}
        fieldConfig={fieldConfig}
        oldData={getValueByConfig(data, fieldConfig)}
        newData={newVal}
        hiddenActionRow={hiddenActionRow}
        updateData={(fieldKey, newValue) =>
          updateData(data.id, fieldKey, newValue)
        }
        editReason={editReason}
      />
    </React.Fragment>
  );
};
