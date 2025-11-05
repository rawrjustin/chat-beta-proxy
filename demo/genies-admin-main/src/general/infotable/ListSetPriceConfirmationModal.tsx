import React from 'react';
import { Button, Text } from 'src/theme';
import { SimpleModal } from 'src/general/modal/SimpleModal';
import { useMutation } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { v4 as uuidv4 } from 'uuid';
import { upsertDropMutation } from 'src/edge/gql/admin/upsertDropMutation';
import Logger from 'shared/logger';

export const ListSetPriceConfirmationModal = ({
  onCancel,
  onClose,
  editionId,
  price,
  newPrice,
  dropId,
  formattedDropEditionPrices,
  refetch,
}: {
  onCancel: () => void;
  onClose: () => void;
  editionId: string;
  price: number;
  newPrice: number;
  dropId: string;
  formattedDropEditionPrices: { editionId: string; dropPrice: string }[];
  refetch: () => {};
}) => {
  const cancelRef = React.useRef(null);
  const adminClient = useAdminClient();

  const [upsertDrop] = useMutation(upsertDropMutation, {
    client: adminClient,
  });

  const handleListingConfirmContinue = async () => {
    let payload = {
      variables: {
        input: {
          id: dropId,
          dropEditionPrices: [
            ...formattedDropEditionPrices,
            {
              editionID: editionId,
              dropPrice: newPrice.toString(),
            },
          ],
          idempotencyKey: uuidv4(),
        },
      },
    };

    const { errors } = await upsertDrop(payload);
    if (errors) {
      Logger.getInstance().error(`upsertDrop error: ${errors[0].message}`, {
        errorMessage: errors[0].message,
        dropId,
        source: 'ListSetPriceConfirmationModal',
      });
    }
    onClose();
    refetch();
  };

  return (
    <SimpleModal
      isOpen={true}
      onClose={onCancel}
      alertHeader="Confirm Listing"
      footer={
        <React.Fragment>
          <Button ref={cancelRef} onClick={onCancel}>
            No, Take me back!
          </Button>
          <Button
            color="black"
            backgroundColor="users.purple"
            ml={3}
            onClick={handleListingConfirmContinue}
          >
            Yes, Continue
          </Button>
        </React.Fragment>
      }
    >
      <React.Fragment>
        <Text>Current price: {price}</Text>
        <Text>New price for listing: {newPrice}</Text>
      </React.Fragment>
    </SimpleModal>
  );
};
