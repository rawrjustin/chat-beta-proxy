import React, { useState } from 'react';
import { HStack, Tooltip, Box, Image } from 'src/theme';
import { FileUploader } from 'src/general/components/Image/FileUploader';
import { UploadType } from './Dropzone';

export const FileUploadComponent = ({
  imageURL,
  imageFile,
  setImageFile,
  uploadType = UploadType.IMAGE,
}: {
  imageURL?: string;
  imageFile?: File;
  setImageFile?: React.Dispatch<React.SetStateAction<File>>;
  uploadType?: UploadType;
}) => {
  const [showImageUploader, setShowImageUploader] = useState<boolean>(false);
  const onCloseImageUploader = () => {
    setShowImageUploader(false);
  };

  const dropImage =
    imageURL != null ? (
      <HStack spacing={8}>
        <Tooltip
          isDisabled={showImageUploader}
          hasArrow
          label="Click to update"
        >
          <Box
            as="button"
            onClick={() => {
              setShowImageUploader(true);
            }}
          >
            <Image src={imageURL} alt="Drop Image" width={['200px', '287px']} />
          </Box>
        </Tooltip>
        {showImageUploader && (
          <FileUploader
            label={`Update ${uploadType}`}
            showClose
            onClose={onCloseImageUploader}
            imageFile={imageFile}
            setImageFile={setImageFile}
          />
        )}
      </HStack>
    ) : (
      <FileUploader
        label={`Upload ${uploadType}`}
        showClose={false}
        onClose={onCloseImageUploader}
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadType={uploadType}
      />
    );
  return dropImage;
};
