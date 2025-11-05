import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Flex,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Image,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from 'src/theme';
import upsertSoftCurrency from 'src/edge/shim/economy/upsertSoftCurrency';
import uploadCurrencyImage from 'src/edge/shim/economy/uploadCurrencyImage';
import getAllCurrenciesForOwner from 'src/edge/shim/economy/getAllCurrencies';
import deleteSoftCurrency from 'src/edge/shim/economy/deleteSoftCurrency';
import { Currency } from 'src/lib/swagger/admin';
import {
  URL_PREFIX,
  CURRENCY_KEY_PREFIX,
} from '../../pages/api/uploadCurrency';
import {
  InternalEnv,
  QaEnv,
  ProdEnv,
  ReleaseQaEnv,
} from 'src/modules/currency/CurrencyEnvironment';

interface CurrencyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (currencyId?: string) => void;
  editCurrency?: Currency;
}

const CurrencyForm: React.FC<CurrencyFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editCurrency,
}) => {
  // Get party IDs based on environment
  // Check which backend environment we're connected to
  const currentEnv = process.env.NEXT_PUBLIC_CURRENCY_ENVIRONMENT || 'internal';
  const isProdBackend = currentEnv === 'prod' || currentEnv === 'release_qa';

  // Party IDs for the dropdown
  const PARTY_IDS = isProdBackend
    ? [
        // For prod backend, show release_qa and prod
        {
          label: `${ReleaseQaEnv.name} (${ReleaseQaEnv.partyId})`,
          value: ReleaseQaEnv.partyId,
        },
        {
          label: `${ProdEnv.name} (${ProdEnv.partyId})`,
          value: ProdEnv.partyId,
        },
      ]
    : [
        // For dev backend, show internal and qa
        {
          label: `${InternalEnv.name} (${InternalEnv.partyId})`,
          value: InternalEnv.partyId,
        },
        {
          label: `${QaEnv.name} (${QaEnv.partyId})`,
          value: QaEnv.partyId,
        },
      ];

  const [currencyName, setCurrencyName] = useState(
    editCurrency?.currencyName || '',
  );
  const [ownerId, setOwnerId] = useState(
    editCurrency?.ownerId || PARTY_IDS[0].value,
  );
  const [ownerType, setOwnerType] = useState(
    editCurrency?.ownerType || 'party',
  );
  const [currencyId, setCurrencyId] = useState(
    editCurrency?.currencyId || uuidv4(),
  );
  const [currencyType, setCurrencyType] = useState(
    editCurrency?.currencyType || 'SOFT',
  );
  const [currencyIconUrl, setCurrencyIconUrl] = useState(
    editCurrency?.currencyIconUrl || '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(
    editCurrency?.currencyIconUrl
      ? `${URL_PREFIX}/${editCurrency.currencyIconUrl}`
      : '',
  );
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>(
    [],
  );
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  // Fetch available currencies for the selected owner when component mounts or owner changes
  useEffect(() => {
    const fetchCurrencies = async () => {
      if (ownerId) {
        try {
          setLoadingCurrencies(true);
          const response = await getAllCurrenciesForOwner(ownerId);
          if (response && response.currencies) {
            setAvailableCurrencies(response.currencies);
          }
        } catch (error) {
          console.error('Failed to fetch currencies:', error);
        } finally {
          setLoadingCurrencies(false);
        }
      }
    };

    fetchCurrencies();
  }, [ownerId]);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Set the icon URL to a path that matches the structure used by the API
      const iconPath = `${CURRENCY_KEY_PREFIX}/${file.name}`;
      setCurrencyIconUrl(iconPath);

      // Create a preview URL for display only
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First upload the image if one was selected, so we have the URL for the currency
      let uploadedIconUrl = currencyIconUrl;
      let imageUploaded = false;

      if (selectedFile) {
        const uploadResult = await uploadCurrencyImage(
          selectedFile,
          'currency',
        );

        // Check if it's an error response
        if ('error' in uploadResult) {
          throw new Error(`Image upload failed: ${uploadResult.error}`);
        }

        // At this point, it must be a successful response with data
        if (uploadResult.data?.url) {
          // Extract the relative path from the full URL
          const fullUrl = uploadResult.data.url;
          const urlPrefix = process.env.NEXT_PUBLIC_CURRENCY_URL_PREFIX;

          // Remove the URL_PREFIX to get just the relative path
          uploadedIconUrl = fullUrl.replace(`${urlPrefix}/`, '');

          setCurrencyIconUrl(uploadedIconUrl);
          imageUploaded = true;
        } else {
          throw new Error('Image upload response missing URL');
        }
      }

      // Only use default icon if we're creating a new currency and no image was uploaded
      // and no existing icon URL is present
      if (
        (!uploadedIconUrl || uploadedIconUrl === '') &&
        !editCurrency?.currencyIconUrl
      ) {
        // Use the default icon path based on currency type
        uploadedIconUrl =
          currencyType === 'HARD'
            ? 'currency/currencies/hard_currency_default_icon.png'
            : 'currency/currencies/soft_currency_default_temp_icon.png';
      } else if (editCurrency?.currencyIconUrl && !imageUploaded) {
        // If editing an existing currency and no new image was uploaded,
        // keep the existing icon URL
        uploadedIconUrl = editCurrency.currencyIconUrl;
      }

      // Validate request data
      if (!currencyId || !currencyName || !ownerId || !ownerType) {
        throw new Error('Missing required fields for currency creation');
      }

      // Now create/update the currency with the icon URL we have
      const response = await upsertSoftCurrency(
        currencyId,
        currencyName,
        ownerId,
        ownerType,
        uploadedIconUrl,
      );

      if (!response) {
        throw new Error('No response received from the currency service');
      }

      if (!response.currencyId) {
        throw new Error(
          `Response missing currencyId: ${JSON.stringify(response)}`,
        );
      }

      toast({
        title: editCurrency ? 'Currency updated' : 'Currency created',
        description: `Successfully ${
          editCurrency ? 'updated' : 'created'
        } the currency ${currencyName}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onSuccess(response.currencyId);
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${
          editCurrency ? 'update' : 'create'
        } currency: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Failed to save currency:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editCurrency?.currencyId) {
      toast({
        title: 'Error',
        description: 'Cannot delete currency without an ID',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSoftCurrency(editCurrency.currencyId);

      toast({
        title: 'Currency deleted',
        description: `Successfully deleted the currency ${currencyName}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSuccess(editCurrency.currencyId);
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete currency: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Failed to delete currency:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const openDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };

  // Helper to find an existing currency ID from the available currencies
  const getExistingSoftCurrencyId = (ownerIdValue: string) => {
    const currency = availableCurrencies.find(
      (c) => c.ownerId === ownerIdValue && c.currencyType === 'SOFT',
    );
    return currency?.currencyId;
  };

  // When owner ID changes, update the currency ID if there's an existing soft currency
  const handleOwnerIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOwnerId = e.target.value;
    setOwnerId(newOwnerId);

    // Only auto-populate currencyId if we're creating a new currency (not editing)
    if (!editCurrency && currencyType === 'SOFT') {
      const existingCurrencyId = getExistingSoftCurrencyId(newOwnerId);
      if (existingCurrencyId) {
        // If an existing soft currency is found, use its ID
        setCurrencyId(existingCurrencyId);
      } else {
        // If no existing soft currency, generate a new UUID
        setCurrencyId(uuidv4());
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {editCurrency ? 'Edit Currency' : 'Create New Currency'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="currencyName" isRequired>
                <FormLabel>Currency Name</FormLabel>
                <Input
                  type="text"
                  value={currencyName}
                  onChange={(e) => setCurrencyName(e.target.value)}
                  placeholder="Enter currency name"
                />
              </FormControl>

              <FormControl id="currencyId" isRequired>
                <FormLabel>Currency ID</FormLabel>
                <Input
                  type="text"
                  value={currencyId}
                  isReadOnly={!!editCurrency}
                  onChange={(e) => setCurrencyId(e.target.value)}
                  placeholder={
                    loadingCurrencies
                      ? 'Loading currency IDs...'
                      : 'Currency ID (auto-generated)'
                  }
                />
              </FormControl>

              <FormControl id="ownerId" isRequired>
                <FormLabel>Owner ID</FormLabel>
                <Select value={ownerId} onChange={handleOwnerIdChange}>
                  {PARTY_IDS.map((party) => (
                    <option key={party.value} value={party.value}>
                      {party.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl id="ownerType" isRequired>
                <FormLabel>Owner Type</FormLabel>
                <Select
                  value={ownerType}
                  onChange={(e) => setOwnerType(e.target.value)}
                >
                  <option value="party">party</option>
                  <option value="experience">experience</option>
                </Select>
              </FormControl>

              <FormControl id="currencyType" isRequired>
                <FormLabel>Currency Type</FormLabel>
                <Select
                  value={currencyType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setCurrencyType(newType);
                    // If changing to SOFT, try to get existing currency ID
                    if (newType === 'SOFT' && !editCurrency) {
                      const existingId = getExistingSoftCurrencyId(ownerId);
                      if (existingId) {
                        setCurrencyId(existingId);
                      }
                    }
                  }}
                  isDisabled={!!editCurrency} // Can't change type for existing currencies
                >
                  <option value="SOFT">SOFT</option>
                  <option value="HARD">HARD</option>
                </Select>
              </FormControl>

              <FormControl id="currencyIcon">
                <FormLabel>Currency Icon</FormLabel>
                <Flex direction="column" alignItems="center">
                  <Box
                    onClick={handleImageClick}
                    cursor="pointer"
                    borderWidth="1px"
                    borderRadius="md"
                    p={2}
                    mb={2}
                    w="100px"
                    h="100px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="gray.100"
                    _hover={{ bg: 'gray.200' }}
                  >
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Currency Icon Preview"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    ) : currencyType === 'HARD' ? (
                      <Text fontSize="4xl">💎</Text>
                    ) : (
                      <Text fontSize="4xl">🪙</Text>
                    )}
                  </Box>
                  <Text fontSize="sm" color="gray.500">
                    Click to upload an icon
                  </Text>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </Flex>
              </FormControl>
            </Stack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Stack
            direction="row"
            spacing={4}
            justifyContent="space-between"
            w="100%"
          >
            {editCurrency && (
              <Button
                colorScheme="red"
                onClick={openDeleteConfirm}
                isLoading={isDeleting}
                variant="outline"
              >
                Delete
              </Button>
            )}
            <Stack direction="row" spacing={4} ml="auto">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={handleSubmit}
                isLoading={isSubmitting}
              >
                {editCurrency ? 'Update' : 'Create'}
              </Button>
            </Stack>
          </Stack>
        </ModalFooter>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteConfirmOpen}
          leastDestructiveRef={cancelRef}
          onClose={closeDeleteConfirm}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Currency
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete the currency &quot;
                {currencyName}&quot;? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={closeDeleteConfirm}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDelete}
                  ml={3}
                  isLoading={isDeleting}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </ModalContent>
    </Modal>
  );
};

export default CurrencyForm;
