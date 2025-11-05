import React from 'react';
import { Box, Button, SkeletonText, Text } from 'src/theme';
import { useQuery } from '@apollo/client';
import { searchNFTsQuery } from 'src/edge/gql/admin/searchNFTsQuery';
import { SimpleModal } from 'src/general/modal/SimpleModal';
import { useMutation } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { sellItemsMutation } from 'src/edge/gql/admin/sellItemsMutation';
import Logger from 'shared/logger';
import { v4 as uuidv4 } from 'uuid';

export const ListForSaleConfirmationModal = ({
  onCancel,
  onClose,
  editionFlowID,
  saleSize,
  newSaleSize,
  listingPrice,
  onOpenCompletion,
  onSetTxID,
}: {
  onCancel: () => void;
  onClose: () => void;
  editionFlowID: number;
  saleSize: number;
  newSaleSize: number;
  listingPrice: number;
  onOpenCompletion: () => void;
  onSetTxID: (txID: string) => void;
}) => {
  const cancelRef = React.useRef(null);
  const adminClient = useAdminClient();
  const [sellItems] = useMutation(sellItemsMutation, {
    client: adminClient,
  });
  const { loading, data, error } = useQuery(searchNFTsQuery, {
    variables: {
      searchInput: {
        base: {
          pagination: {
            cursor: '',
            direction: 'RIGHT',
            limit: newSaleSize,
          },
        },
        filters: {
          byEditionFlowIDs: [editionFlowID],
          byNFTStatus: 'AVAILABLE_TO_LIST',
          byOwnerFlowAddress: process.env.NEXT_PUBLIC_FLOW_RECEIVER_ADDRESS,
        },
      },
    },
    client: adminClient,
  });

  if (error) {
    Logger.getInstance().error(`searchNFTsQuery error: ${error.message}`, {
      errorMessage: error.message,
      editionFlowID,
      newSaleSize,
      NFTStatus: 'AVAILABLE_TO_LIST',
      source: 'ListForSaleConfirmationModal',
    });
  }

  const nftFlowIdsToList =
    data?.searchNFTs?.nfts
      ?.filter((nft) => nft.flowID != null)
      .map((nft) => nft.flowID) ?? [];

  const handleListingConfirmContinue = () => {
    sellItems({
      variables: {
        input: {
          nftFlowIDs: nftFlowIdsToList,
          idempotencyKey: uuidv4(),
          nftName: 'Genies',
          nftStorageName: 'genies',
          ftName: 'DapperUtilityCoin',
          ftStorageName: 'dapperUtilityCoin',
          price: listingPrice,
        },
      },
    }).then((response) => {
      const data = response?.data?.sellItems ?? null;
      if (data?.success && data?.txID != null) {
        onSetTxID(data?.txID);
      }
    });
    onClose();
    setTimeout(() => {
      onOpenCompletion();
    }, 300);
  };

  const numberToList = <strong>{nftFlowIdsToList.length}</strong>;
  const numerRequested =
    nftFlowIdsToList.length < newSaleSize ? <del>{newSaleSize}</del> : null;
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
            isDisabled={loading || !data || nftFlowIdsToList?.length === 0}
          >
            Yes, Continue
          </Button>
        </React.Fragment>
      }
    >
      {loading || !data ? (
        <Box>
          <SkeletonText mt="4" noOfLines={4} spacing="4" />
        </Box>
      ) : (
        <React.Fragment>
          <Text>Current edition sale size: {saleSize}</Text>
          <Text>
            New sale size for listing: {numberToList} {numerRequested}
          </Text>
          {nftFlowIdsToList.length === 0 ? (
            <Text as="mark">
              Sorry, we do not have any nft avaiable to list for sale, please
              mint more if needed.
            </Text>
          ) : nftFlowIdsToList.length < newSaleSize ? (
            <Text as="mark">
              Sorry, we can only list {numberToList} {numerRequested} for sale,
              please mint more if needed.
            </Text>
          ) : null}
          <Text>
            Total sale size:{' '}
            <strong>{saleSize + nftFlowIdsToList.length}</strong>
          </Text>
          <Text marginTop={2}>
            Listing price: <strong>{listingPrice}</strong>
          </Text>
        </React.Fragment>
      )}
    </SimpleModal>
  );
};
