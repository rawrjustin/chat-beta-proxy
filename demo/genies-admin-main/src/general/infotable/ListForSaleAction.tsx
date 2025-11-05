import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  useDisclosure,
  Alert,
  AlertIcon,
  Tooltip,
  WarningTwoIcon,
  HStack,
  Heading,
} from 'src/theme';
import { MintEditionModal } from 'src/general/modal/MintEditionModal';
import { SimpleModal } from 'src/general/modal/SimpleModal';
import { FlowScanAction } from 'src/modules/Actions/FlowScanAction';
import { ListForSaleConfirmationModal } from './ListForSaleConfirmationModal';

export const sizeWarning = (
  <Box p={5}>
    <HStack>
      <WarningTwoIcon w={4} h={4} />
      <Heading fontSize="md">
        Please do not start new listing if there is an existing one!
      </Heading>
    </HStack>
    <Text mt={2} fontSize="xs">
      Sorry, we can only allow one listing task (for sale or claim) at the same
      time.
    </Text>
  </Box>
);

export const ListForSaleAction = ({
  editionFlowID,
  saleSize,
  dropPrice,
}: {
  editionFlowID: number;
  saleSize: number;
  dropPrice: number;
}) => {
  const [newSaleSize, setNewSaleSize] = useState(0);
  const [listingPrice, setListingPrice] = useState(dropPrice);
  const [txID, setTxID] = useState(null);

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

  const showTxid = txID != null && !txID.includes(',');

  return (
    <React.Fragment>
      <Tooltip
        hasArrow
        label={sizeWarning}
        color="white"
        placement="auto"
        bg="red.700"
      >
        <Button onClick={onOpenModal}>List For Sale</Button>
      </Tooltip>
      <MintEditionModal
        modalHeader="List For Sale"
        isOpen={isModalOpen}
        onClose={onCloseModal}
      >
        <Box m={6} mt={0} display="flex" flexDirection="column">
          <Text>Listing price:</Text>
          <NumberInput
            color="tomato"
            defaultValue={listingPrice}
            min={1}
            keepWithinRange={true}
            mb={1}
          >
            <NumberInputField
              placeholder="Enter price to list for Sale"
              onChange={(event) => setListingPrice(Number(event.target.value))}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Alert status="info">
            <AlertIcon />
            Please double check the listing price. It can not be changed after
            finish listing.
          </Alert>
          <Text mt={2}>Current sale size: {saleSize}</Text>
          <NumberInput
            color="tomato"
            mb={1}
            value={newSaleSize > 0 ? newSaleSize : ''}
          >
            <NumberInputField
              placeholder="Enter amount to list for Sale"
              onChange={(event) => setNewSaleSize(Number(event.target.value))}
            />
          </NumberInput>
          <Alert mb={2} status="info">
            <AlertIcon />
            Total sale size after listing will be: {saleSize + newSaleSize}
          </Alert>
          <Button
            isDisabled={!newSaleSize || !listingPrice}
            ml="auto"
            onClick={() => {
              onCloseModal();
              setTimeout(() => {
                onOpenConfirm();
              }, 300);
            }}
          >
            List For Sale
          </Button>
        </Box>
      </MintEditionModal>
      {isConfirmOpen && (
        <ListForSaleConfirmationModal
          onCancel={handleListingConfirmCancel}
          onClose={onCloseConfirm}
          editionFlowID={editionFlowID}
          saleSize={saleSize}
          newSaleSize={newSaleSize}
          listingPrice={listingPrice}
          onOpenCompletion={onOpenCompletion}
          onSetTxID={setTxID}
        />
      )}
      <SimpleModal
        isOpen={isCompletionOpen}
        onClose={onCloseCompletion}
        alertHeader="Listing For Sale"
      >
        <Flex justifyContent="center" direction="column">
          <Text textAlign="center">Check flow status</Text>
          {showTxid && (
            <Text
              mb={1}
              textAlign="center"
              fontSize="sm"
              color="gray.500"
            >{`txID: ${txID.substring(0, 6)}...${txID.substring(
              txID.length - 6,
            )}`}</Text>
          )}
          <FlowScanAction txID={showTxid ? txID : null} />
        </Flex>
      </SimpleModal>
    </React.Fragment>
  );
};
