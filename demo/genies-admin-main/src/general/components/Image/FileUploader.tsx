import { Box, Container, FormLabel, HStack, Button } from 'src/theme';
import * as React from 'react';
import { Dropzone } from './Dropzone';
import { AiOutlineClose } from 'react-icons/ai';
import { UploadType } from './Dropzone';

export const FileUploader = ({
  label,
  showClose,
  onClose,
  imageFile,
  setImageFile,
  uploadType,
}: {
  label?: string;
  showClose: boolean;
  onClose: () => void;
  imageFile?: File;
  setImageFile?: React.Dispatch<React.SetStateAction<File>>;
  uploadType?: UploadType;
}) => (
  <Box as="section" bg="bg-surface" py={{ base: '4', md: '8' }}>
    <Container maxW="lg">
      <HStack justify="space-between">
        <FormLabel fontSize="xs">{label}</FormLabel>
        {showClose && (
          <Button
            color="users.purple"
            size="xs"
            variant="ghost"
            leftIcon={<AiOutlineClose />}
            onClick={onClose}
          >
            close
          </Button>
        )}
      </HStack>
      <Dropzone
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadType={uploadType}
      />
    </Container>
  </Box>
);
