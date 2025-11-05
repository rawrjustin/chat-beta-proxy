import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  NumberInput,
  NumberInputField,
  Text,
  useDisclosure,
  Alert,
  AlertIcon,
  Tooltip,
} from 'src/theme';
import { MintEditionModal } from 'src/general/modal/MintEditionModal';
import { SimpleModal } from 'src/general/modal/SimpleModal';
import { FlowScanAction } from 'src/modules/Actions/FlowScanAction';
import { ListForClaimConfirmationModal } from './ListForClaimConfirmationModal';
import { sizeWarning } from './ListForSaleAction';
const MAX_CLAIM_COUNT = 30;

export const ListForClaimAction = ({
  editionFlowID,
  claimSize,
}: {
  editionFlowID: number;
  claimSize: number;
}) => {
  const [newClaimSize, setNewClaimSize] = useState(0);
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
  // Control Mint completed dialog open
  const {
    onOpen: onOpenCompletion,
    isOpen: isCompletionOpen,
    onClose: onCloseCompletion,
  } = useDisclosure();

  const handleListingConfirmCancel = () => {
    onCloseConfirm();
    setTimeout(() => {
      onOpenModal();
    }, 300);
  };

  const setClaimSizeValue = (value: number) => {
    setNewClaimSize(value > MAX_CLAIM_COUNT ? MAX_CLAIM_COUNT : value);
  };

  return (
    <React.Fragment>
      <Tooltip
        hasArrow
        label={sizeWarning}
        color="white"
        placement="auto"
        bg="red.700"
      >
        <Button onClick={onOpenModal}>List For Claim</Button>
      </Tooltip>
      <MintEditionModal
        modalHeader="List For Claim"
        isOpen={isModalOpen}
        onClose={onCloseModal}
      >
        <Box m={6} mt={0} display="flex" flexDirection="column">
          <Text>Current claim size: {claimSize}</Text>
          <NumberInput
            color="tomato"
            min={1}
            max={MAX_CLAIM_COUNT}
            value={newClaimSize > 0 ? newClaimSize : ''}
          >
            <NumberInputField
              mt={1}
              mb={1}
              placeholder={`Enter amount to list for Claim between 1 and ${MAX_CLAIM_COUNT}`}
              onChange={(event) =>
                setClaimSizeValue(Number(event.target.value))
              }
            />
          </NumberInput>
          <Alert mb={2} status="info">
            <AlertIcon />
            Total claim size after listing will be: {claimSize + newClaimSize}
          </Alert>
          <Button
            isDisabled={!newClaimSize}
            ml="auto"
            onClick={() => {
              onCloseModal();
              setTimeout(() => {
                onOpenConfirm();
              }, 300);
            }}
          >
            List For Claim
          </Button>
        </Box>
      </MintEditionModal>
      {isConfirmOpen && (
        <ListForClaimConfirmationModal
          onCancel={handleListingConfirmCancel}
          onClose={onCloseConfirm}
          editionFlowID={editionFlowID}
          claimSize={claimSize}
          newClaimSize={newClaimSize}
          onOpenCompletion={onOpenCompletion}
        />
      )}
      <SimpleModal
        isOpen={isCompletionOpen}
        onClose={onCloseCompletion}
        alertHeader="Listing For Claim"
      >
        <Flex justifyContent="center" direction="column">
          <Text textAlign="center">Check flow status on</Text>
          <FlowScanAction />
        </Flex>
      </SimpleModal>
    </React.Fragment>
  );
};
