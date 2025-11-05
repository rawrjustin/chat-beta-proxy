import { Fragment, useState } from 'react';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import { SimpleModal } from 'src/general/modal/SimpleModal';
import {
  Button,
  HStack,
  useDisclosure,
  Text,
  Textarea,
  VStack,
  useToast,
} from 'src/theme';
import Logger from 'shared/logger';
import {
  generateAuthHeader,
  getApiConfig,
  useAccessToken,
} from 'src/lib/swagger/mobile/util';
import { ThingsApi } from 'src/lib/swagger/mobile';
import { ThingVersionStatus } from './types';
import { useUser } from 'src/lib/user/UserContext';

export const ThingBuildActions = ({
  thingId,
  thingVersionId,
  status,
}: {
  thingVersionId: string;
  thingId: string;
  status: string;
}) => {
  const {
    isOpen: isRejectionModalOpen,
    onOpen: onOpenRejectionModal,
    onClose: onCloseRejectionModal,
  } = useDisclosure();
  const {
    isOpen: isConfirmModalOpen,
    onOpen: onOpenConfirmModal,
    onClose: onCloseConfirmModal,
  } = useDisclosure();
  const [comments, setComments] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>();
  const accessToken = useAccessToken();
  const toast = useToast();
  const userId = useUser();

  const canReview = status === ThingVersionStatus.UNDERREVIEW;

  if (!canReview) return null;

  const onCommentsChange = (e) => {
    const textAreaValue = e.target.value;
    setComments(textAreaValue);
  };

  const onSubmitReview = async (
    status: ThingVersionStatus,
    onCloseModal: () => void,
  ) => {
    try {
      setIsSubmitting(true);
      const api = new ThingsApi(getApiConfig());
      await api.updateThingVersion(
        {
          thingVersionId: thingVersionId,
          thingId: thingId,
          reviewerComment: comments,
          reviewerId: userId,
          status: status.toString(),
        },
        thingId,
        generateAuthHeader(accessToken),
      );
      toast({
        title: 'Success',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      setIsSubmitting(false);
      onCloseModal();
    } catch (err) {
      Logger.getInstance().error(
        `Submit ${status} review failed! Thing id is ${thingId}, thing version id is ${thingVersionId}. ${err.message}`,
        {
          errorMessage: err.message,
          source: 'ThingBuildActions onSubmitReview',
        },
      );
      toast({
        title: `Submit ${status} review failed!`,
        description: `${err.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <HStack>
      <Button
        size="md"
        color="users.purple"
        variant="ghost"
        leftIcon={<HiOutlineCheckCircle />}
        onClick={onOpenConfirmModal}
      >
        Approve
      </Button>
      <Button
        size="md"
        color="users.purple"
        variant="ghost"
        leftIcon={<HiOutlineXCircle />}
        onClick={onOpenRejectionModal}
      >
        Reject
      </Button>
      {/* add rejection notes modal */}
      <SimpleModal
        alertHeader="Confirm Refusal"
        isOpen={isRejectionModalOpen}
        onClose={onCloseRejectionModal}
        footer={
          <Fragment>
            <Button
              variant="ghost"
              mr={3}
              isLoading={isSubmitting}
              onClick={onCloseRejectionModal}
            >
              Cancel
            </Button>
            <Button
              color="white"
              backgroundColor="red.600"
              isDisabled={!comments?.length}
              isLoading={isSubmitting}
              onClick={() =>
                onSubmitReview(
                  ThingVersionStatus.REJECTED,
                  onCloseRejectionModal,
                )
              }
            >
              Reject
            </Button>
          </Fragment>
        }
      >
        <VStack spacing={4}>
          <Text>
            Are you sure you want to reject this build:{' '}
            <Text as="b">{thingVersionId}</Text>? Rejecting a build requires
            adding notes. Developer will see the notes you added here.
          </Text>
          <Textarea
            size="md"
            value={comments}
            onChange={onCommentsChange}
            placeholder="Please fill in the reasons for refusal..."
          />
        </VStack>
      </SimpleModal>
      {/* approve confirm modal */}
      <SimpleModal
        alertHeader="Confirm Approval"
        isOpen={isConfirmModalOpen}
        onClose={onCloseConfirmModal}
        footer={
          <Fragment>
            <Button
              variant="ghost"
              mr={3}
              isLoading={isSubmitting}
              onClick={onCloseConfirmModal}
            >
              Cancel
            </Button>
            <Button
              color="black"
              backgroundColor="users.purple"
              isLoading={isSubmitting}
              onClick={() =>
                onSubmitReview(ThingVersionStatus.APPROVED, onCloseConfirmModal)
              }
            >
              Confirm
            </Button>
          </Fragment>
        }
      >
        <Text>
          Are you sure you want to approve this build:{' '}
          <Text as="b">{thingVersionId}</Text>? Developer can publish this build
          once it is approved.
        </Text>
      </SimpleModal>
    </HStack>
  );
};
