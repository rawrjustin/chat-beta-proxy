import React from 'react';
import { Box, Button, SkeletonText, Text } from 'src/theme';
import { useQuery } from '@apollo/client';
import { searchNFTsQuery } from 'src/edge/gql/admin/searchNFTsQuery';
import { SimpleModal } from 'src/general/modal/SimpleModal';
import { useMutation } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { createAirdropMutation } from 'src/edge/gql/admin/createAirdropMutation';
import Logger from 'shared/logger';
import { v4 as uuidv4 } from 'uuid';

export const ListForClaimConfirmationModal = ({
  onCancel,
  onClose,
  editionFlowID,
  claimSize,
  newClaimSize,
  onOpenCompletion,
}: {
  onCancel: () => void;
  onClose: () => void;
  editionFlowID: number;
  claimSize: number;
  newClaimSize: number;
  onOpenCompletion: () => void;
}) => {
  const cancelRef = React.useRef(null);
  const adminClient = useAdminClient();
  const [createAidrop] = useMutation(createAirdropMutation, {
    client: adminClient,
  });
  const { loading, data, error } = useQuery(searchNFTsQuery, {
    variables: {
      searchInput: {
        base: {
          pagination: {
            cursor: '',
            direction: 'RIGHT',
            limit: newClaimSize,
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
      newClaimSize,
      NFTStatus: 'AVAILABLE_TO_LIST',
      source: 'ListForClaimonfirmationModal',
    });
  }

  const nftFlowIdsToList =
    data?.searchNFTs?.nfts
      ?.filter((nft) => nft.flowID != null)
      .map((nft) => nft.flowID) ?? [];

  const handleListingConfirmContinue = () => {
    createAidrop({
      variables: {
        input: {
          nftFlowIDs: nftFlowIdsToList, // Todo: add the nft list here.
          airdropType: 'OWNERSHIPLESS',
          idempotencyKey: uuidv4(),
        },
      },
    });
    onClose();
    setTimeout(() => {
      onOpenCompletion();
    }, 300);
  };

  const numberToList = <strong>{nftFlowIdsToList.length}</strong>;
  const numerRequested =
    nftFlowIdsToList.length < newClaimSize ? <del>{newClaimSize}</del> : null;
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
          <Text>Current edition claim size: {claimSize}</Text>
          <Text>
            New claim size for listing: {numberToList} {numerRequested}
          </Text>
          {nftFlowIdsToList.length === 0 ? (
            <Text as="mark">
              Sorry, we do not have any nft avaiable to list for claim, please
              mint more if needed.
            </Text>
          ) : nftFlowIdsToList.length < newClaimSize ? (
            <Text as="mark">
              Sorry, we can only list {numberToList} {numerRequested} for claim,
              please mint more if needed.
            </Text>
          ) : null}
          <Text>
            Total claim size:{' '}
            <strong>{claimSize + nftFlowIdsToList.length}</strong>
          </Text>
        </React.Fragment>
      )}
    </SimpleModal>
  );
};
