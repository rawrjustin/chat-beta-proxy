import { useRouter } from 'next/router';
import React from 'react';
import updateGear from 'src/edge/shim/updateGear';
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Textarea,
  Radio,
  RadioGroup,
  Stack,
  HStack,
} from 'src/theme';

interface Props {
  gearVersionId: string;
  existingReviewerComment: string;
}

const GearDetailsAdminActions: React.FC<Props> = ({
  gearVersionId,
  existingReviewerComment,
}) => {
  const router = useRouter();
  const { gearId } = router.query;
  const [reviewerComment, setReviewerComment] = React.useState('');
  const [selectedValue, setSelectedValue] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateGear(
        gearId as string,
        gearVersionId,
        selectedValue,
        reviewerComment.length > 0
          ? existingReviewerComment + ' [' + reviewerComment + '] '
          : existingReviewerComment,
      );
      window.location.reload();
    } catch (error) {
      console.error('Error updating gear details', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Heading>Admin Actions</Heading>
      <RadioGroup
        onChange={setSelectedValue}
        value={selectedValue}
        mt={4}
        ml={2}
      >
        <Stack direction="row">
          <Radio value="approved">Approve</Radio>
          <Radio value="rejected">Reject</Radio>
          <Radio value="flag">Flag</Radio>
          <Radio value="published">Published</Radio>
        </Stack>
      </RadioGroup>
      <FormControl id="rejection" mt={4}>
        <FormLabel>Notes for Rejection (Internal ONLY)</FormLabel>
        <Textarea
          border="1px solid transparent"
          value={reviewerComment}
          background="grey.6"
          borderRadius={8}
          onChange={(e) => {
            setReviewerComment(e.target.value);
          }}
          fontSize={14}
          placeholder="Reasons for asset rejection or flag"
          resize="none"
          rows={6}
          _focusVisible={{ border: '1px solid transparent' }}
          _hover={{ border: '1px solid transparent' }}
        />
      </FormControl>
      <HStack justifyContent="end" width="100%">
        <Button mt={4} type="submit">
          Save
        </Button>
      </HStack>
    </form>
  );
};

export default GearDetailsAdminActions;
