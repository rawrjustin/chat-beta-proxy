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
} from 'src/theme';
import React, { useState } from 'react';
import { MintEditionModal } from 'src/general/modal/MintEditionModal';
import { SimpleModal } from 'src/general/modal/SimpleModal';
import { useMutation } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { mintNFTsMutation } from 'src/edge/gql/admin/mintNFTsMutation';
import { v4 as uuidv4 } from 'uuid';
import { FlowScanAction } from 'src/modules/Actions/FlowScanAction';

interface Props {
  editionSize: number;
  editionFlowID: string;
}

export const MintEditionAction: React.FC<Props> = ({
  editionSize,
  editionFlowID,
}) => {
  const cancelRef = React.useRef(null);

  const [mintEditionSize, setMintEditionSize] = useState(0);
  const adminClient = useAdminClient();
  const [mintNFTs] = useMutation(mintNFTsMutation, {
    client: adminClient,
  });

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

  const useMintNFTs = () => {
    const flowReceiverAddress = process.env.NEXT_PUBLIC_FLOW_RECEIVER_ADDRESS;
    let payload = {
      variables: {
        input: {
          orders: [
            {
              editionFlowID,
              quantity: mintEditionSize,
            },
          ],
          idempotencyKey: uuidv4(),
          flowReceiverAddress,
        },
      },
    };

    mintNFTs(payload);
    onCloseConfirm();
    setTimeout(() => {
      onOpenCompletion();
    }, 300);
  };

  const handleMintConfirmationClose = () => {
    onCloseConfirm();
    setTimeout(() => {
      onOpenModal();
    }, 300);
  };

  return (
    <React.Fragment>
      <Button onClick={onOpenModal}>Mint</Button>
      <MintEditionModal
        modalHeader="Mint Editions"
        isOpen={isModalOpen}
        onClose={onCloseModal}
      >
        <Box m={6} mt={0} display="flex" flexDirection="column">
          <Text>Current edition size: {editionSize}</Text>
          <NumberInput value={mintEditionSize > 0 ? mintEditionSize : ''}>
            <NumberInputField
              mt={2}
              mb={2}
              placeholder="Enter amount to mint"
              onChange={(event) =>
                setMintEditionSize(Number(event.target.value))
              }
            />
          </NumberInput>
          <Alert mb={2} status="info">
            <AlertIcon />
            Total edition size after minting will be:{' '}
            {editionSize + mintEditionSize}
          </Alert>
          <Button
            isDisabled={!mintEditionSize}
            ml="auto"
            onClick={() => {
              onCloseModal();
              setTimeout(() => {
                onOpenConfirm();
              }, 300);
            }}
          >
            Mint
          </Button>
        </Box>
      </MintEditionModal>

      <SimpleModal
        isOpen={isConfirmOpen}
        onClose={handleMintConfirmationClose}
        alertHeader="Confirm mint edition"
        footer={
          <React.Fragment>
            <Button ref={cancelRef} onClick={handleMintConfirmationClose}>
              No, Take me back!
            </Button>
            <Button
              color="black"
              backgroundColor="users.purple"
              ml={3}
              onClick={useMintNFTs}
            >
              Yes, Continue
            </Button>
          </React.Fragment>
        }
      >
        <React.Fragment>
          <Text>Current edition size: {editionSize}</Text>
          <Text>Minting size: {mintEditionSize}</Text>
          <Text>Total edition size: {editionSize + mintEditionSize}</Text>
        </React.Fragment>
      </SimpleModal>

      <SimpleModal
        isOpen={isCompletionOpen}
        onClose={onCloseCompletion}
        alertHeader="Edition minting"
      >
        <Flex justifyContent="center" direction="column">
          <Text textAlign="center">Check flow status on</Text>
          <FlowScanAction />
        </Flex>
      </SimpleModal>
    </React.Fragment>
  );
};
