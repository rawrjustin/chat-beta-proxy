import React, { useState } from 'react';
import {
  Box,
  Button,
  NumberInput,
  NumberInputField,
  Text,
  useDisclosure,
  Alert,
  AlertIcon,
} from 'src/theme';
import { MintEditionModal } from 'src/general/modal/MintEditionModal';
import { ListSetPriceConfirmationModal } from './ListSetPriceConfirmationModal';
import { useQuery } from '@apollo/client';
import { useConsumerClient } from 'src/lib/apollo/MultiApolloProvider';
import Logger from 'shared/logger';
import { searchDropsWithEditionsQuery } from 'src/edge/gql/consumer/searchDropsQuery';

export const ListSetPriceAction = ({
  dropId,
  editionId,
  curPrice,
  refetch,
}: {
  dropId: string;
  editionId: string;
  curPrice: number;
  refetch: () => {};
}) => {
  const consumerClient = useConsumerClient();

  const { data, loading, error } = useQuery(searchDropsWithEditionsQuery, {
    variables: {
      searchInput: {
        filters: {
          byID: [dropId],
          notIDs: [],
          byDropStatuses: [],
        },
      },
    },
    client: consumerClient,
  });

  if (error) {
    Logger.getInstance().error(
      `searchDropEditionsQuery filterd by dropId error: ${error.message}`,
      {
        errorMessage: error.message,
        dropId,
        source: 'ListSetPriceAction',
      },
    );
  }

  const formattedDropEditionPrices = data?.searchDrops?.drops?.[0]?.dropEditions
    ?.filter((dropEdition) => dropEdition?.editionId !== editionId)
    .map((dropEdition) => {
      return {
        editionID: dropEdition?.editionId,
        dropPrice: dropEdition?.dropPrice,
      };
    });

  const [newPrice, setNewPrice] = useState(0);
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

  const handleListingConfirmCancel = () => {
    onCloseConfirm();
    setTimeout(() => {
      onOpenModal();
    }, 300);
  };

  return (
    <React.Fragment>
      <Button onClick={onOpenModal}>Set Price</Button>
      <MintEditionModal
        modalHeader="Set Price"
        isOpen={isModalOpen}
        onClose={onCloseModal}
      >
        <Box m={6} mt={0} display="flex" flexDirection="column">
          <Text>Current Price: {curPrice}</Text>
          <NumberInput color="tomato" value={newPrice > 0 ? newPrice : ''}>
            <NumberInputField
              mt={1}
              mb={1}
              placeholder="Enter price to set"
              onChange={(event) => setNewPrice(Number(event.target.value))}
            />
          </NumberInput>
          <Alert mb={2} status="info">
            <AlertIcon />
            New Price: {newPrice}
          </Alert>
          <Button
            isDisabled={!newPrice || loading}
            ml="auto"
            onClick={() => {
              onCloseModal();
              setTimeout(() => {
                onOpenConfirm();
              }, 300);
            }}
          >
            Set Price
          </Button>
        </Box>
      </MintEditionModal>
      {isConfirmOpen && (
        <ListSetPriceConfirmationModal
          onCancel={handleListingConfirmCancel}
          onClose={onCloseConfirm}
          editionId={editionId}
          newPrice={newPrice}
          price={curPrice}
          dropId={dropId}
          formattedDropEditionPrices={formattedDropEditionPrices}
          refetch={refetch}
        />
      )}
    </React.Fragment>
  );
};
