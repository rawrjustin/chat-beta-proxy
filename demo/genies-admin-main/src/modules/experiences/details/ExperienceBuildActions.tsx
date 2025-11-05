import {
  Button,
  HStack,
  useDisclosure,
  Textarea,
  Text,
  useToast,
  VStack,
} from 'src/theme';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import { ExperienceBuildStatus } from 'src/edge/__generated/types/consumer/globalTypes';
import { Fragment, useState } from 'react';
import { SimpleModal } from 'src/general/modal/SimpleModal';
import { useConsumerClient } from 'src/lib/apollo/MultiApolloProvider';
import { useMutation } from '@apollo/client';
import { upsertExperienceBuildMutation } from 'src/edge/gql/consumer/upsertExperienceBuildMutation';
import Logger from 'shared/logger';
import { BuildProps } from './ExperienceBuildsUnlimitedList';

const canReview = (status: ExperienceBuildStatus): boolean => {
  return status === ExperienceBuildStatus.UNDERREVIEW;
};

export const ExperienceBuildActions = ({
  build,
  updateBuildsList,
}: {
  build: BuildProps;
  updateBuildsList: () => Promise<void>;
}) => {
  const showReviewAction = canReview(build.status);

  return (
    <HStack>
      {showReviewAction && (
        <ReviewBuildButtonGroup
          buildId={build.id}
          appClientId={build.appClientId}
          updateBuildsList={updateBuildsList}
        />
      )}
    </HStack>
  );
};

const ReviewBuildButtonGroup = ({
  buildId,
  appClientId,
  updateBuildsList,
}: {
  buildId: string;
  appClientId: string;
  updateBuildsList: () => Promise<void>;
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
  const consumerClient = useConsumerClient();
  const [upsertExperienceBuild] = useMutation(upsertExperienceBuildMutation, {
    client: consumerClient,
  });
  const toast = useToast();
  const [notes, setNotes] = useState<string>();
  const [submittingReview, setSubmittingReview] = useState<boolean>();

  const handleSubmitReview = async (
    status: ExperienceBuildStatus,
    onCloseModal: () => void,
  ) => {
    try {
      setSubmittingReview(true);

      if (!buildId.length) {
        throw new Error('Invalid build id!');
      }

      if (status === ExperienceBuildStatus.REJECTED && !notes?.length) {
        throw new Error('Rejecting a build requires adding notes!');
      }

      const { errors } = await upsertExperienceBuild({
        variables: {
          input: {
            id: buildId,
            status: status,
            description: notes,
            experienceClientId: appClientId,
          },
        },
      });

      if (errors) {
        throw new Error(`${errors[0].message}`);
      }

      toast({
        title: 'Success',
        description: `Build ${status} successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      setSubmittingReview(false);
      await updateBuildsList();
      onCloseModal();
    } catch (err) {
      Logger.getInstance().error(
        `Submit ${status} review failed! Build id is ${buildId}. ${err.message}`,
        {
          errorMessage: err.message,
          source: 'ExperienceBuildActions handleSubmitReview',
        },
      );
      toast({
        title: 'Error',
        description: `Submit ${status} review failed! ${err.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      setSubmittingReview(false);
    }
  };

  const onNotesChange = (e) => {
    const textAreaValue = e.target.value;
    setNotes(textAreaValue);
  };

  return (
    <Fragment>
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
            <Button variant="ghost" mr={3} onClick={onCloseRejectionModal}>
              Cancel
            </Button>
            <Button
              color="white"
              backgroundColor="red.600"
              isDisabled={!notes?.length || submittingReview}
              onClick={() => {
                handleSubmitReview(
                  ExperienceBuildStatus.REJECTED,
                  onCloseRejectionModal,
                );
              }}
            >
              Reject
            </Button>
          </Fragment>
        }
      >
        <VStack spacing={4}>
          <Text>
            Are you sure you want to reject this build:{' '}
            <Text as="b">{buildId}</Text>? Rejecting a build requires adding
            notes. Developer will see the notes you added here.
          </Text>
          <Textarea
            size="md"
            value={notes}
            onChange={onNotesChange}
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
            <Button variant="ghost" mr={3} onClick={onCloseConfirmModal}>
              Cancel
            </Button>
            <Button
              color="black"
              backgroundColor="users.purple"
              isDisabled={submittingReview}
              onClick={() => {
                handleSubmitReview(
                  ExperienceBuildStatus.APPROVED,
                  onCloseConfirmModal,
                );
              }}
            >
              Confirm
            </Button>
          </Fragment>
        }
      >
        <Text>
          Are you sure you want to approve this build:{' '}
          <Text as="b">{buildId}</Text>? Developer can publish this build once
          it is approved.
        </Text>
      </SimpleModal>
    </Fragment>
  );
};
