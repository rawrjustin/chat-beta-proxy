import React from 'react';
import {
  Button,
  Center,
  CenterProps,
  HStack,
  Icon,
  Square,
  Text,
  VStack,
  Input,
  FormControl,
  Image,
  useToast,
} from 'src/theme';
import axios from 'axios';
import { useGetFeatureFlags, AdminFeatureFlags } from 'src/lib/statsig';
import { FiUploadCloud } from 'react-icons/fi';
import Logger from 'shared/logger';

export enum UploadType {
  IMAGE = 'IMAGE',
  ZIP = 'ZIP',
  CSV = 'CSV',
}

const validateFile = (
  file: File,
  config: { limit: number; types: string[] },
  notificationFunc: (msg: String) => void,
) => {
  const size = file?.size ?? -1;
  const type = file?.type ?? null;
  if (size < 0 || type === null) {
    notificationFunc(`This browser is not supported!`);
    return false;
  }

  if (size > config.limit) {
    notificationFunc(`The file size is over the LIMIT!`);
    return false;
  }
  if (!config.types.includes(type)) {
    notificationFunc(`The file type is not supported!`);
    return false;
  }
  return true;
};

const FileTypeConfig = {
  [UploadType.IMAGE]: {
    limit: 2 * 1024 * 1024, // 2MB
    types: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
    description: 'Support PNG, JPG or WEBP image up to 2MB',
    validate: validateFile,
  },
  [UploadType.ZIP]: {
    limit: 10 * 1024 * 1024, // 10MB
    // The zip file type on window is 'application/x-zip-compressed and on mac is 'application/zip'.
    types: ['application/zip', 'application/x-zip-compressed'],
    description: 'Support ZIP file up to 10MB',
    validate: (
      file: File,
      config: { limit: number; types: string[] },
      notificationFunc: (msg: String) => void,
    ) => {
      if (!validateFile(file, config, notificationFunc)) return false;
      const type = file?.type;
      if (!type?.includes('zip')) {
        notificationFunc(`The file type is not supported!`);
        return false;
      }
      return true;
    },
  },
  [UploadType.CSV]: {
    limit: 1 * 1024 * 1024, // 1MB
    types: ['text/csv'],
    description: 'Support CSV file up to 1MB',
    validate: validateFile,
  },
};

interface Props extends CenterProps {
  imageFile?: File;
  setImageFile?: React.Dispatch<React.SetStateAction<File>>;
  uploadType?: UploadType;
}

export const Dropzone = ({
  imageFile,
  setImageFile,
  uploadType,
  ...restProps
}: Props) => {
  const toast = useToast();
  const inputRef = React.useRef(null);
  const [dragActive, setDragActive] = React.useState<boolean>(false);

  const [imageContent, setImageContent] = React.useState(null);
  const [reader] = React.useState<FileReader>(() => new FileReader());
  const enableImageUploadButton = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_UPLOAD_IMAGE_BUTTON,
  );

  React.useEffect(() => {
    if (uploadType === UploadType.IMAGE) {
      reader.addEventListener('load', (event) => {
        setImageContent(event.target.result);
      });
      if (imageFile) reader.readAsDataURL(imageFile);
    }
  }, [imageFile, reader, uploadType]);

  // handle drag events
  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const notificationFunc = (msg: string) => {
    toast({
      title: 'Error',
      description: msg,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
  };

  // triggers when file is dropped
  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFile = e.dataTransfer.files[0];
      if (
        FileTypeConfig[uploadType].validate(
          newFile,
          FileTypeConfig[uploadType],
          notificationFunc,
        )
      ) {
        setImageFile(newFile);
      }
    }
  };
  // triggers when file is selected with click
  const handleChange = function (e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const newFile = e.target.files[0];
      if (
        FileTypeConfig[uploadType].validate(
          newFile,
          FileTypeConfig[uploadType],
          notificationFunc,
        )
      ) {
        setImageFile(newFile);
      }
    }
    // Reset the file list if there is a file
    if (e.target.files.length > 0) {
      const dt = new DataTransfer();
      e.target.files = dt.files;
    }
  };

  // triggers the input when the button is clicked
  const onButtonClick = () => {
    inputRef.current.click();
  };

  // handle upload image for testing submit
  const uploadFile = async () => {
    if (!imageFile) {
      toast({
        title: 'Error',
        description: `Please select image first!`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    const headers = {
      'content-type': imageFile.type,
      'x-filename': imageFile.name,
      'x-filetype': imageFile.type,
    };
    if (uploadType === UploadType.ZIP) {
      headers['x-collection-name'] = 'TestCollections';
      headers['x-guid'] = 'testguid';
    }
    try {
      const res = await axios.post(`/api/upload`, imageFile, {
        headers,
      });
      if (enableImageUploadButton) console.log(res);
      return res;
    } catch (e) {
      Logger.getInstance().error(
        `Upload File Error: ${e?.response?.data?.error} `,
        {
          errorMessage: e.message,
          source: 'uploadFile',
        },
      );
    }
  };

  return (
    <FormControl
      id="form-file-upload"
      onDragEnter={handleDrag}
      onSubmit={(e) => e.preventDefault()}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Center
        borderWidth="1px"
        borderRadius="lg"
        px="6"
        py="4"
        bg={dragActive ? 'blue.200' : 'gray.800'}
        {...restProps}
      >
        <VStack spacing="3">
          <Input ref={inputRef} type="file" onChange={handleChange} hidden />
          <Square size="10" bg="bg-subtle" borderRadius="lg">
            <Icon as={FiUploadCloud} boxSize="5" color="muted" />
          </Square>
          <VStack spacing="1">
            <HStack spacing="1" whiteSpace="nowrap">
              <Button
                variant="link"
                colorScheme="purple"
                size="sm"
                onClick={onButtonClick}
              >
                Click to upload
              </Button>
              <Text fontSize="sm" color="muted">
                or drag and drop
              </Text>
            </HStack>
            <Text fontSize="xs" color="muted">
              {FileTypeConfig[uploadType].description}
            </Text>
          </VStack>
          {imageFile && <Text>Selected File: {imageFile.name}</Text>}
          {imageContent && (
            <Image
              src={imageContent}
              w="200px"
              h="200px"
              alt="Selected Image Preview"
            />
          )}
        </VStack>
      </Center>
      {enableImageUploadButton && (
        <Button onClick={uploadFile}> Test Submit</Button>
      )}
    </FormControl>
  );
};
