import React, { useState } from 'react';
import type { NextPage } from 'next';
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
  Heading,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Textarea,
  VStack,
  HStack,
  Divider,
  UnorderedList,
  ListItem,
  Checkbox,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from 'src/theme';
// eslint-disable-next-line no-restricted-imports
import { Code, IconButton } from '@chakra-ui/react';
// No direct import of Chakra icons since they're causing issues
import getUserInventory from 'src/edge/shim/inventory/getUserInventory';
import createMetadataStore from 'src/edge/shim/inventory/createMetadataStore';
import getMetadataTag from 'src/edge/shim/inventory/getMetadataTag';
import setMetadataTag from 'src/edge/shim/inventory/setMetadataTag';
import updateMetadataTag from 'src/edge/shim/inventory/updateMetadataTag';
import getMetadataStore from 'src/edge/shim/inventory/getMetadataStore';
import createAssetSupply from 'src/edge/shim/inventory/createAssetSupply';
import mintAsset from 'src/edge/shim/inventory/mintAsset';
import burnAssetInstance from 'src/edge/shim/inventory/burnAssetInstance';
import deleteAssets from 'src/edge/shim/inventory/deleteAssets';
// V2 Inventory Functions (Real endpoints)
import getInventoryV2AnimationLibrary from 'src/edge/shim/inventory/getInventoryV2AnimationLibrary';
import getInventoryV2AvatarBase from 'src/edge/shim/inventory/getInventoryV2AvatarBase';
import getInventoryV2AvatarEyes from 'src/edge/shim/inventory/getInventoryV2AvatarEyes';
import getInventoryV2AvatarFlair from 'src/edge/shim/inventory/getInventoryV2AvatarFlair';
import getInventoryV2AvatarMakeup from 'src/edge/shim/inventory/getInventoryV2AvatarMakeup';
import getInventoryV2ColorPresets from 'src/edge/shim/inventory/getInventoryV2ColorPresets';
import getInventoryV2Gear from 'src/edge/shim/inventory/getInventoryV2Gear';
import getInventoryV2ImageLibrary from 'src/edge/shim/inventory/getInventoryV2ImageLibrary';
import getInventoryV2ModelLibrary from 'src/edge/shim/inventory/getInventoryV2ModelLibrary';
import {
  InventoryAssetInstance,
  InventoryIndexedField,
  CreateMetadataStoreResponse,
  GetMetadataTagResponse,
} from 'src/lib/swagger/admin';
import {
  InternalEnv,
  QaEnv,
  ProdEnv,
  ReleaseQaEnv,
} from 'src/modules/currency/CurrencyEnvironment';

// Delete Asset interfaces (from the commit mentioned by user)
export interface DeleteAssetInstanceResponse {
  success?: boolean;
}

export interface DeleteAssetsRequest {
  assetIds?: Array<string>;
}

export interface DeleteAssetsResponse {
  deletedIds?: Array<string>;
  failedIds?: Array<string>;
}

// Get User Inventory Panel Component
interface GetUserInventoryPanelProps {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  inventory: InventoryAssetInstance[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryAssetInstance[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  partyId: string;
  setPartyId: React.Dispatch<React.SetStateAction<string>>;
  nextCursor: string | null;
  setNextCursor: React.Dispatch<React.SetStateAction<string | null>>;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  colors: string[];
  setColors: React.Dispatch<React.SetStateAction<string[]>>;
  PARTY_IDS: { label: string; value: string }[];
  handleUserIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loadMoreInventory: () => Promise<void>;
  toast: any;
}

const GetUserInventoryPanel: React.FC<GetUserInventoryPanelProps> = ({
  userId,
  inventory,
  loading,
  error,
  partyId,
  nextCursor,
  limit,
  categories,
  setCategories,
  colors,
  setColors,
  PARTY_IDS,
  handleUserIdChange,
  handleSubmit,
  loadMoreInventory,
  setLimit,
  setInventory,
  toast,
}) => {
  // Add state for selected items
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Add some predefined category and color options
  // These could be fetched from an API in a real implementation
  const categoryOptions = [
    { value: 'WEARABLE', label: 'Wearable' },
    { value: 'ACCESSORY', label: 'Accessory' },
    { value: 'COLLECTIBLE', label: 'Collectible' },
    { value: 'CONSUMABLE', label: 'Consumable' },
  ];

  const colorOptions = [
    { value: 'RED', label: 'Red' },
    { value: 'BLUE', label: 'Blue' },
    { value: 'GREEN', label: 'Green' },
    { value: 'YELLOW', label: 'Yellow' },
    { value: 'BLACK', label: 'Black' },
    { value: 'WHITE', label: 'White' },
  ];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setCategories(selectedOptions);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setColors(selectedOptions);
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = inventory
        .map((item) => item.assetInstanceId)
        .filter((id): id is string => Boolean(id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  // Delete handlers
  const handleDeleteSelected = async () => {
    try {
      setDeleteLoading(true);

      // Use burnAssetInstance for each selected item (multiple API calls)
      const deletePromises = selectedItems.map((instanceId) =>
        burnAssetInstance(instanceId, partyId),
      );

      const responses = await Promise.allSettled(deletePromises);

      let successCount = 0;
      let failedCount = 0;
      const successfulIds: string[] = [];

      responses.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.success) {
          successCount++;
          successfulIds.push(selectedItems[index]);
        } else {
          failedCount++;
        }
      });

      // Remove successfully deleted items from inventory
      if (successfulIds.length > 0) {
        const updatedInventory = inventory.filter(
          (item) => !successfulIds.includes(item.assetInstanceId || ''),
        );
        setInventory(updatedInventory);
        setSelectedItems([]);
      }

      if (successCount > 0) {
        toast({
          title: 'Success',
          description: `Successfully deleted ${successCount} asset instance(s)`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      if (failedCount > 0) {
        toast({
          title:
            failedCount === selectedItems.length ? 'Error' : 'Partial Success',
          description: `Failed to delete ${failedCount} asset instance(s)`,
          status: failedCount === selectedItems.length ? 'error' : 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to delete items:', error);
      toast({
        title: 'Error',
        description: `Failed to delete items: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
      onClose();
    }
  };

  const handleDeleteSingle = async (itemId: string) => {
    try {
      setDeleteLoading(true);
      const response = await burnAssetInstance(itemId, partyId);

      if (response.success) {
        // Remove deleted item from inventory
        const updatedInventory = inventory.filter(
          (item) => item.assetInstanceId !== itemId,
        );
        setInventory(updatedInventory);
        setSelectedItems(selectedItems.filter((id) => id !== itemId));

        toast({
          title: 'Success',
          description: 'Successfully deleted asset instance',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete asset instance',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast({
        title: 'Error',
        description: `Failed to delete asset instance: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Stack spacing={4} mb={8}>
        <form onSubmit={handleSubmit}>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={4}>
            <FormControl isRequired maxW={{ md: '400px' }}>
              <FormLabel>User ID</FormLabel>
              <Input
                type="text"
                value={userId}
                onChange={handleUserIdChange}
                placeholder="Enter user ID"
              />
            </FormControl>

            <FormControl maxW={{ md: '100px' }}>
              <FormLabel>Limit</FormLabel>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                min={1}
                max={100}
              />
            </FormControl>
          </Flex>

          {/* Filters Section */}
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={4}>
            <FormControl maxW={{ md: '300px' }}>
              <FormLabel>Categories</FormLabel>
              <Select
                multiple
                height="100px"
                value={categories}
                onChange={handleCategoryChange}
                variant="filled"
                sx={{
                  '& option': {
                    bg: 'transparent',
                    color: 'inherit',
                  },
                  '& option:checked': {
                    bg: 'blue.900',
                    color: 'white',
                    width: '100%',
                  },
                }}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Hold Ctrl/Cmd to select multiple
              </Text>
            </FormControl>

            <FormControl maxW={{ md: '300px' }}>
              <FormLabel>Colors</FormLabel>
              <Select
                multiple
                height="100px"
                value={colors}
                onChange={handleColorChange}
                variant="filled"
                sx={{
                  '& option': {
                    bg: 'transparent',
                    color: 'inherit',
                  },
                  '& option:checked': {
                    bg: 'blue.900',
                    color: 'white',
                    width: '100%',
                  },
                }}
              >
                {colorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Hold Ctrl/Cmd to select multiple
              </Text>
            </FormControl>
          </Flex>

          {/* Active Filters Display */}
          {(categories.length > 0 || colors.length > 0) && (
            <Box mb={4} p={2} borderRadius="md" borderWidth="1px">
              <Text fontWeight="medium" mb={1}>
                Active Filters:
              </Text>
              <Flex wrap="wrap" gap={2}>
                {categories.map((cat) => (
                  <Badge key={cat} colorScheme="blue">
                    Category: {cat}
                  </Badge>
                ))}
                {colors.map((color) => (
                  <Badge key={color} colorScheme="purple">
                    Color: {color}
                  </Badge>
                ))}
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setCategories([]);
                    setColors([]);
                  }}
                >
                  Clear All
                </Button>
              </Flex>
            </Box>
          )}

          <Box alignSelf="flex-end" mb={{ base: 4, md: 0 }}>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText="Fetching"
            >
              Get Inventory
            </Button>
          </Box>
        </form>
      </Stack>

      {error && (
        <Box
          p={4}
          mb={4}
          bg="red.50"
          color="red.800"
          borderRadius="md"
          borderLeft="4px"
          borderLeftColor="red.500"
        >
          {error}
        </Box>
      )}

      {inventory.length > 0 ? (
        <Box overflowX="auto">
          <Flex justify="space-between" align="center" mb={4}>
            <Text>
              Showing {inventory.length} item(s)
              {nextCursor && ' (more available)'}
            </Text>
            {selectedItems.length > 0 && (
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  {selectedItems.length} item(s) selected
                </Text>
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={onOpen}
                  isLoading={deleteLoading}
                >
                  Delete Selected ({selectedItems.length})
                </Button>
              </HStack>
            )}
          </Flex>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th width="50px">
                    <Checkbox
                      isChecked={
                        inventory.length > 0 &&
                        selectedItems.length === inventory.length
                      }
                      isIndeterminate={
                        selectedItems.length > 0 &&
                        selectedItems.length < inventory.length
                      }
                      onChange={handleSelectAll}
                    />
                  </Th>
                  <Th>Item ID</Th>
                  <Th>Asset ID</Th>
                  <Th>Properties</Th>
                  <Th>Tags</Th>
                  <Th>Created At</Th>
                  <Th>Updated At</Th>
                  <Th width="100px">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {inventory.map((item) => (
                  <Tr key={item.assetInstanceId}>
                    <Td>
                      <Checkbox
                        isChecked={selectedItems.includes(
                          item.assetInstanceId || '',
                        )}
                        onChange={(e) =>
                          handleSelectItem(
                            item.assetInstanceId || '',
                            e.target.checked,
                          )
                        }
                        isDisabled={!item.assetInstanceId}
                      />
                    </Td>
                    <Td>
                      <Code fontSize="xs">{item.assetInstanceId || '-'}</Code>
                    </Td>
                    <Td>
                      <Code fontSize="xs">{item.asset?.assetId || '-'}</Code>
                    </Td>
                    <Td>
                      {item.asset ? (
                        <Box maxW="300px" overflowX="auto">
                          <pre
                            style={{
                              fontSize: '0.7rem',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {JSON.stringify(item.asset, null, 2)}
                          </pre>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </Td>
                    <Td>
                      {item.tags ? (
                        <Stack spacing={1}>
                          {item.tags.category?.map((tag, index) => (
                            <Badge
                              key={`category-${index}`}
                              colorScheme="green"
                              fontSize="xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.color?.map((tag, index) => (
                            <Badge
                              key={`color-${index}`}
                              colorScheme="purple"
                              fontSize="xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.partyId && (
                            <Badge colorScheme="blue" fontSize="xs">
                              Party: {item.tags.partyId}
                            </Badge>
                          )}
                        </Stack>
                      ) : (
                        '-'
                      )}
                    </Td>
                    <Td>
                      {item.dateCreated
                        ? new Date(item.dateCreated * 1000).toLocaleString()
                        : '-'}
                    </Td>
                    <Td>
                      {item.dateCreated
                        ? new Date(item.dateCreated * 1000).toLocaleString()
                        : '-'}
                    </Td>
                    <Td>
                      <IconButton
                        aria-label="Delete item"
                        icon={<span>🗑️</span>}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() =>
                          handleDeleteSingle(item.assetInstanceId || '')
                        }
                        isLoading={deleteLoading}
                        isDisabled={!item.assetInstanceId}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          {/* Confirmation Dialog */}
          <AlertDialog
            isOpen={isOpen}
            onClose={onClose}
            leastDestructiveRef={undefined}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete Selected Items
                </AlertDialogHeader>

                <AlertDialogBody>
                  Are you sure you want to delete {selectedItems.length}{' '}
                  selected item(s)? This action cannot be undone.
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button onClick={onClose}>Cancel</Button>
                  <Button
                    colorScheme="red"
                    onClick={handleDeleteSelected}
                    ml={3}
                    isLoading={deleteLoading}
                  >
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          {nextCursor && (
            <Box mt={4} textAlign="center">
              <Button
                onClick={loadMoreInventory}
                isLoading={loading}
                loadingText="Loading"
                variant="outline"
              >
                Load More
              </Button>
            </Box>
          )}
        </Box>
      ) : !loading && !error ? (
        <Box p={4} textAlign="center" color="gray.500">
          No inventory data to display. Enter a user ID and click &quot;Get
          Inventory&quot;.
        </Box>
      ) : null}

      {loading && !error && inventory.length === 0 && (
        <Flex justify="center" align="center" my={8}>
          <Spinner mr={2} />
          <Text>Loading inventory data...</Text>
        </Flex>
      )}
    </React.Fragment>
  );
};

// Metadata Store Panel Component
interface MetadataStorePanelProps {
  partyId: string;
  PARTY_IDS: { label: string; value: string }[];
  toast: any;
}

const MetadataStorePanel: React.FC<MetadataStorePanelProps> = ({
  partyId,
  PARTY_IDS,
  toast,
}) => {
  // Create Store state
  const [namespace, setNamespace] = useState('');
  const [fields, setFields] = useState<InventoryIndexedField[]>([
    { name: '', type: 'STRING' },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateMetadataStoreResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Get Store state
  const [getNamespace, setGetNamespace] = useState('');
  const [getLoading, setGetLoading] = useState(false);
  const [getResult, setGetResult] = useState<any>(null);
  const [getError, setGetError] = useState<string | null>(null);

  const handleNamespaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNamespace(e.target.value);
  };

  const handleGetNamespaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGetNamespace(e.target.value);
  };

  const addField = () => {
    setFields([...fields, { name: '', type: 'STRING' }]);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const handleFieldChange = (
    index: number,
    key: keyof InventoryIndexedField,
    value: string,
  ) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!namespace.trim()) {
      setError('Namespace is required');
      return;
    }

    // Validate all fields have name and type
    const invalidFields = fields.filter((field) => !field.name?.trim());
    if (invalidFields.length > 0) {
      setError('All fields must have a name');
      return;
    }

    // Make sure we have at least one field
    if (fields.length === 0) {
      setError('At least one indexed field is required');
      return;
    }

    // Filter out any empty fields
    const validFields = fields.filter((field) => field.name?.trim());

    // Make sure field names are unique
    const fieldNames = validFields.map((field) => field.name.trim());
    if (new Set(fieldNames).size !== fieldNames.length) {
      setError('Field names must be unique');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Normalize fields data
      const normalizedFields = validFields.map((field) => ({
        name: field.name.trim(),
        type: field.type || 'STRING',
      }));

      const response = await createMetadataStore(
        namespace,
        normalizedFields,
        partyId,
      );

      setResult(response);
      toast({
        title: 'Metadata Store Created',
        description: `Store key: ${response.metadataStoreKey}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setError(`Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!getNamespace.trim()) {
      setGetError('Namespace is required');
      return;
    }

    setGetLoading(true);
    setGetError(null);
    setGetResult(null);

    try {
      const response = await getMetadataStore(getNamespace, partyId);

      setGetResult(response);
      toast({
        title: 'Metadata Store Retrieved',
        description: `Successfully retrieved metadata store with namespace: ${getNamespace}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Failed to get metadata store:', err);
      setGetError(`Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setGetLoading(false);
    }
  };

  return (
    <Box>
      <Tabs size="md" variant="line">
        <TabList>
          <Tab>Create Store</Tab>
          <Tab>Get Store</Tab>
        </TabList>

        <TabPanels>
          {/* Create Store Panel */}
          <TabPanel>
            <Text mb={4}>
              Create a metadata store to define indexed fields for inventory
              items.
            </Text>

            <form onSubmit={handleCreateSubmit}>
              <Stack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Namespace</FormLabel>
                  <Input
                    type="text"
                    value={namespace}
                    onChange={handleNamespaceChange}
                    placeholder="Enter namespace"
                  />
                </FormControl>

                <Box>
                  <HStack mb={2}>
                    <Text fontWeight="medium">Indexed Fields</Text>
                    <Button
                      aria-label="Add Field"
                      onClick={addField}
                      size="sm"
                      colorScheme="blue"
                    >
                      +
                    </Button>
                  </HStack>

                  {fields.map((field, index) => (
                    <HStack key={index} mb={3} align="flex-end">
                      <FormControl isRequired>
                        <FormLabel>Field Name</FormLabel>
                        <Input
                          value={field.name}
                          onChange={(e) =>
                            handleFieldChange(index, 'name', e.target.value)
                          }
                          placeholder="Field name"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Field Type</FormLabel>
                        <Select
                          value={field.type}
                          onChange={(e) =>
                            handleFieldChange(index, 'type', e.target.value)
                          }
                        >
                          <option value="STRING">String</option>
                          <option value="INTEGER">Integer</option>
                          <option value="BOOLEAN">Boolean</option>
                        </Select>
                      </FormControl>

                      <Button
                        aria-label="Remove Field"
                        onClick={() => removeField(index)}
                        isDisabled={fields.length <= 1}
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                      >
                        ✕
                      </Button>
                    </HStack>
                  ))}
                </Box>

                {error && (
                  <Box
                    p={4}
                    bg="red.600"
                    color="white"
                    borderRadius="md"
                    borderLeft="4px"
                    borderLeftColor="red.300"
                  >
                    {error}
                  </Box>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                  loadingText="Creating"
                >
                  Create Metadata Store
                </Button>
              </Stack>
            </form>

            {result && (
              <Box mt={6} p={4} bg="blue.700" borderRadius="md" color="white">
                <Text fontWeight="bold">
                  Metadata Store created successfully!
                </Text>
                <Text mt={2}>
                  <strong>Store Key:</strong> {result.metadataStoreKey}
                </Text>
                <Text fontSize="sm" color="blue.100" mt={2}>
                  Save this key to use when setting metadata tags.
                </Text>
              </Box>
            )}
          </TabPanel>

          {/* Get Store Panel */}
          <TabPanel>
            <Text mb={4}>
              Retrieve information about an existing metadata store by
              namespace.
            </Text>

            <form onSubmit={handleGetSubmit}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Namespace</FormLabel>
                  <Input
                    type="text"
                    value={getNamespace}
                    onChange={handleGetNamespaceChange}
                    placeholder="Enter namespace"
                  />
                </FormControl>

                {getError && (
                  <Box
                    p={4}
                    bg="red.600"
                    color="white"
                    borderRadius="md"
                    borderLeft="4px"
                    borderLeftColor="red.300"
                  >
                    {getError}
                  </Box>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={getLoading}
                  loadingText="Retrieving"
                >
                  Get Metadata Store
                </Button>
              </Stack>
            </form>

            {getResult && (
              <Box mt={6} p={4} bg="blue.700" borderRadius="md" color="white">
                <Heading size="sm" mb={3}>
                  Metadata Store Details
                </Heading>
                <Stack spacing={2}>
                  <Text>
                    <strong>Namespace:</strong> {getResult.namespace}
                  </Text>
                  <Text>
                    <strong>Metadata Store Key:</strong>{' '}
                    {getResult.metadataStoreKey}
                  </Text>
                  <Text>
                    <strong>Created At:</strong>{' '}
                    {new Date(getResult.createdAt * 1000).toLocaleString()}
                  </Text>
                  <Text fontWeight="bold" mt={2}>
                    Indexed Fields:
                  </Text>
                  {getResult.fields?.length > 0 ? (
                    <UnorderedList pl={5} color="blue.100">
                      {getResult.fields.map((field, i) => (
                        <ListItem key={i}>
                          {field.name} ({field.type})
                        </ListItem>
                      ))}
                    </UnorderedList>
                  ) : (
                    <Text color="blue.100">No indexed fields defined</Text>
                  )}
                </Stack>
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

// Metadata Tags Panel Component
interface MetadataTagsPanelProps {
  partyId: string;
  PARTY_IDS: { label: string; value: string }[];
  toast: any;
}

const MetadataTagsPanel: React.FC<MetadataTagsPanelProps> = ({
  partyId,
  PARTY_IDS,
  toast,
}) => {
  // Get Tag state
  const [getTagId, setGetTagId] = useState('');
  const [getNamespace, setGetNamespace] = useState('');
  const [getTagLoading, setGetTagLoading] = useState(false);
  const [getTagResult, setGetTagResult] =
    useState<GetMetadataTagResponse | null>(null);
  const [getTagError, setGetTagError] = useState<string | null>(null);

  // Set Tag state
  const [namespace, setNamespace] = useState('');
  const [metadataStoreKey, setMetadataStoreKey] = useState('');
  const [setTagLoading, setSetTagLoading] = useState(false);
  const [setTagSuccess, setSetTagSuccess] = useState(false);
  const [setTagError, setSetTagError] = useState<string | null>(null);

  // State for multiple tags
  const [tags, setTags] = useState<{ id: string; body: string }[]>([
    { id: '', body: '{}' },
  ]);

  // Update Tag state
  const [updateTagId, setUpdateTagId] = useState('');
  const [updateNamespace, setUpdateNamespace] = useState('');
  const [updateMetadataStoreKey, setUpdateMetadataStoreKey] = useState('');
  const [updateTagBody, setUpdateTagBody] = useState('{}');
  const [updateTagLoading, setUpdateTagLoading] = useState(false);
  const [updateTagSuccess, setUpdateTagSuccess] = useState(false);
  const [updateTagError, setUpdateTagError] = useState<string | null>(null);

  const handleTagIdChange = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index].id = value;
    setTags(newTags);
  };

  const handleTagBodyChange = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index].body = value;
    setTags(newTags);
  };

  const addTagField = () => {
    setTags([...tags, { id: '', body: '{}' }]);
  };

  const removeTagField = (index: number) => {
    if (tags.length <= 1) return;
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const handleGetTag = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!getTagId.trim() || !getNamespace.trim()) {
      setGetTagError('Tag ID and Namespace are required');
      return;
    }

    setGetTagLoading(true);
    setGetTagResult(null);
    setGetTagError(null);

    try {
      const response = await getMetadataTag(getTagId, getNamespace, partyId);

      setGetTagResult(response);

      if (!response.tag) {
        setGetTagError('Tag not found');
      } else {
        toast({
          title: 'Tag Found',
          description: `Successfully retrieved tag: ${getTagId}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Unknown error occurred';
      setGetTagError(`Error: ${errorMessage}`);

      toast({
        title: 'Error Retrieving Tag',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setGetTagLoading(false);
    }
  };

  const handleSetTag = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!namespace.trim() || !metadataStoreKey.trim()) {
      setSetTagError('Namespace and Metadata Store Key are required');
      return;
    }

    // Trim the namespace and metadataStoreKey to avoid URL encoding issues
    const trimmedNamespace = namespace.trim();
    const trimmedMetadataStoreKey = metadataStoreKey.trim();

    // Validate tags
    if (tags.some((tag) => !tag.id.trim())) {
      setSetTagError('All tags must have an ID');
      return;
    }

    // Validate JSON for all tag bodies
    const parsedTags = [];
    try {
      for (const tag of tags) {
        const parsedBody = tag.body ? JSON.parse(tag.body) : {};
        parsedTags.push({
          id: tag.id.trim(),
          body: parsedBody,
        });
      }
    } catch (err) {
      setSetTagError('All tag bodies must be valid JSON');
      return;
    }

    setSetTagLoading(true);
    setSetTagSuccess(false);
    setSetTagError(null);

    try {
      // Send all tags at once with trimmed values
      await setMetadataTag(
        parsedTags,
        trimmedNamespace,
        trimmedMetadataStoreKey,
        partyId,
      );

      setSetTagSuccess(true);
      toast({
        title: 'Metadata Tags Set',
        description: `Successfully set ${parsedTags.length} tag(s)`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Unknown error occurred';
      setSetTagError(`Error: ${errorMessage}`);

      toast({
        title: 'Error Setting Tags',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSetTagLoading(false);
    }
  };

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateTagLoading(true);
    setUpdateTagSuccess(false);
    setUpdateTagError(null);

    try {
      const updates = JSON.parse(updateTagBody);
      await updateMetadataTag(
        updateTagId,
        updateNamespace,
        updateMetadataStoreKey,
        { body: updates },
      );

      setUpdateTagSuccess(true);
      toast({
        title: 'Success',
        description: 'Tag updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update tag';
      setUpdateTagError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdateTagLoading(false);
    }
  };

  return (
    <Box>
      <Tabs size="md" variant="line">
        <TabList>
          <Tab>Get Tag</Tab>
          <Tab>Set Tags</Tab>
          <Tab>Update Tag</Tab>
        </TabList>

        <TabPanels>
          {/* Get Tag Panel */}
          <TabPanel>
            <Text mb={4}>Get a metadata tag by its ID and namespace.</Text>

            <form onSubmit={handleGetTag}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Tag ID</FormLabel>
                  <Input
                    value={getTagId}
                    onChange={(e) => setGetTagId(e.target.value)}
                    placeholder="Enter tag ID"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Namespace</FormLabel>
                  <Input
                    value={getNamespace}
                    onChange={(e) => setGetNamespace(e.target.value)}
                    placeholder="Enter namespace"
                  />
                </FormControl>

                {getTagError && (
                  <Box
                    p={4}
                    bg="red.600"
                    color="white"
                    borderRadius="md"
                    borderLeft="4px"
                    borderLeftColor="red.300"
                  >
                    {getTagError}
                  </Box>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={getTagLoading}
                  loadingText="Fetching"
                >
                  Get Tag
                </Button>
              </Stack>
            </form>

            {getTagResult && getTagResult.tag && (
              <Box mt={6} p={4} bg="blue.700" borderRadius="md" color="white">
                <Text fontWeight="bold">Tag Found!</Text>
                <Divider my={3} />
                <VStack align="stretch" spacing={2}>
                  <Text>
                    <strong>Tag ID:</strong> {getTagResult.tag.id}
                  </Text>
                  <Box>
                    <Text mb={1}>
                      <strong>Tag Body:</strong>
                    </Text>
                    <Box
                      p={3}
                      bg="blue.800"
                      borderRadius="md"
                      maxH="300px"
                      overflowY="auto"
                    >
                      <pre>
                        {getTagResult.tag.body
                          ? JSON.stringify(getTagResult.tag.body, null, 2)
                          : '{}'}
                      </pre>
                    </Box>
                  </Box>
                </VStack>
              </Box>
            )}
          </TabPanel>

          {/* Set Tags Panel */}
          <TabPanel>
            <Text mb={4}>Set metadata tags for inventory items.</Text>

            <form onSubmit={handleSetTag}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Namespace</FormLabel>
                  <Input
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    placeholder="Enter namespace"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Metadata Store Key</FormLabel>
                  <Input
                    value={metadataStoreKey}
                    onChange={(e) => setMetadataStoreKey(e.target.value)}
                    placeholder="Enter metadata store key"
                  />
                </FormControl>

                <Box>
                  <HStack mb={2} justify="space-between">
                    <Text fontWeight="medium">Tags</Text>
                    <Button
                      aria-label="Add Tag"
                      onClick={addTagField}
                      size="sm"
                      colorScheme="blue"
                    >
                      + Add Tag
                    </Button>
                  </HStack>

                  {tags.map((tag, index) => (
                    <Box
                      key={index}
                      p={3}
                      mb={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="blue.400"
                      bg="blue.800"
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text color="white" fontWeight="medium">
                          Tag {index + 1}
                        </Text>
                        <Button
                          aria-label="Remove Tag"
                          onClick={() => removeTagField(index)}
                          isDisabled={tags.length <= 1}
                          colorScheme="red"
                          variant="ghost"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </HStack>

                      <FormControl isRequired mb={3}>
                        <FormLabel color="white">Tag ID</FormLabel>
                        <Input
                          value={tag.id}
                          onChange={(e) =>
                            handleTagIdChange(index, e.target.value)
                          }
                          placeholder="Enter tag ID"
                          bg="blue.900"
                          color="white"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color="white">Tag Body (JSON)</FormLabel>
                        <Textarea
                          value={tag.body}
                          onChange={(e) =>
                            handleTagBodyChange(index, e.target.value)
                          }
                          placeholder="{}"
                          minHeight="100px"
                          bg="blue.900"
                          color="white"
                          fontFamily="monospace"
                        />
                        <Text fontSize="sm" color="blue.200" mt={1}>
                          Valid JSON object (ex:{' '}
                          {`{"creatorId": "user123", "version": 1}`})
                        </Text>
                      </FormControl>
                    </Box>
                  ))}
                </Box>

                {setTagError && (
                  <Box
                    p={4}
                    bg="red.600"
                    color="white"
                    borderRadius="md"
                    borderLeft="4px"
                    borderLeftColor="red.300"
                  >
                    {setTagError}
                  </Box>
                )}

                {setTagSuccess && (
                  <Box
                    p={4}
                    bg="green.600"
                    color="white"
                    borderRadius="md"
                    borderLeft="4px"
                    borderLeftColor="green.300"
                  >
                    Tags set successfully!
                  </Box>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={setTagLoading}
                  loadingText="Setting Tags"
                >
                  Set Tags
                </Button>
              </Stack>
            </form>
          </TabPanel>

          {/* Update Tag Panel */}
          <TabPanel>
            <Text mb={4}>
              Update an existing metadata tag by providing the tag ID,
              namespace, metadata store key, and the updated fields.
            </Text>

            <form onSubmit={handleUpdateTag}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Tag ID</FormLabel>
                  <Input
                    value={updateTagId}
                    onChange={(e) => setUpdateTagId(e.target.value)}
                    placeholder="Asset or instance ID"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Namespace</FormLabel>
                  <Input
                    value={updateNamespace}
                    onChange={(e) => setUpdateNamespace(e.target.value)}
                    placeholder="e.g., tag_defaultCloset"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Metadata Store Key</FormLabel>
                  <Input
                    value={updateMetadataStoreKey}
                    onChange={(e) => setUpdateMetadataStoreKey(e.target.value)}
                    placeholder="Get from metadata store response"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Tag Updates (JSON)</FormLabel>
                  <Textarea
                    value={updateTagBody}
                    onChange={(e) => setUpdateTagBody(e.target.value)}
                    placeholder='{"orgId": "org-123", "appId": "app-456", "isDefault": true}'
                    rows={6}
                    fontFamily="monospace"
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Only include fields you want to update
                  </Text>
                </FormControl>

                {updateTagError && (
                  <Box
                    p={4}
                    bg="red.600"
                    color="white"
                    borderRadius="md"
                    borderLeft="4px"
                    borderLeftColor="red.300"
                  >
                    {updateTagError}
                  </Box>
                )}

                {updateTagSuccess && (
                  <Box
                    p={4}
                    bg="green.600"
                    color="white"
                    borderRadius="md"
                    borderLeft="4px"
                    borderLeftColor="green.300"
                  >
                    Tag updated successfully!
                  </Box>
                )}

                <Button
                  type="submit"
                  colorScheme="purple"
                  isLoading={updateTagLoading}
                  loadingText="Updating"
                >
                  Update Tag
                </Button>
              </Stack>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

// Asset Supply Panel Component
interface AssetSupplyPanelProps {
  partyId: string;
  PARTY_IDS: { label: string; value: string }[];
  toast: any;
}

const AssetSupplyPanel: React.FC<AssetSupplyPanelProps> = ({
  partyId,
  PARTY_IDS,
  toast,
}) => {
  const [assetId, setAssetId] = useState('');
  const [assetType, setAssetType] = useState('WEARABLE');
  const [creatorId, setCreatorId] = useState('');
  const [maximumSupply, setMaximumSupply] = useState(10);
  const [availableSupply, setAvailableSupply] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAssetIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssetId(e.target.value);
  };

  const handleAssetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAssetType(e.target.value);
  };

  const handleCreatorIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatorId(e.target.value);
  };

  const handleMaximumSupplyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setMaximumSupply(parseInt(e.target.value, 10) || 1);
  };

  const handleAvailableSupplyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setAvailableSupply(parseInt(e.target.value, 10) || 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!assetId.trim()) {
      setError('Asset ID is required');
      return;
    }

    if (!creatorId.trim()) {
      setError('Creator ID is required');
      return;
    }

    if (maximumSupply < 1) {
      setError('Maximum supply must be at least 1');
      return;
    }

    if (availableSupply < 1 || availableSupply > maximumSupply) {
      setError(
        'Available supply must be at least 1 and not exceed maximum supply',
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await createAssetSupply(
        assetId,
        assetType,
        creatorId,
        partyId,
        maximumSupply,
        availableSupply,
      );

      setResult(response);
      toast({
        title: 'Asset Supply Created',
        description: `Successfully created supply of ${availableSupply}/${maximumSupply} units for asset: ${assetId}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Failed to create asset supply:', err);
      setError(`Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Text mb={4}>
        Create a supply of assets by specifying details like asset ID and
        supply.
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Asset ID</FormLabel>
            <Input
              type="text"
              value={assetId}
              onChange={handleAssetIdChange}
              placeholder="Enter asset ID"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Asset Type</FormLabel>
            <Select value={assetType} onChange={handleAssetTypeChange}>
              <option value="WEARABLE">Wearable</option>
              <option value="DECOR">Decor</option>
              <option value="AVATAR">Avatar</option>
              <option value="SMART_AVATAR">Smart Avatar</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Creator ID</FormLabel>
            <Input
              type="text"
              value={creatorId}
              onChange={handleCreatorIdChange}
              placeholder="Enter creator ID"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Maximum Supply</FormLabel>
            <Input
              type="number"
              value={maximumSupply}
              onChange={handleMaximumSupplyChange}
              min={1}
              placeholder="Enter maximum supply"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Available Supply</FormLabel>
            <Input
              type="number"
              value={availableSupply}
              onChange={handleAvailableSupplyChange}
              min={1}
              max={maximumSupply}
              placeholder="Enter available supply"
            />
          </FormControl>

          {error && (
            <Box
              p={4}
              bg="red.50"
              color="red.800"
              borderRadius="md"
              borderLeft="4px"
              borderLeftColor="red.500"
            >
              {error}
            </Box>
          )}

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Creating"
          >
            Create Asset Supply
          </Button>
        </Stack>
      </form>

      {result && (
        <Box mt={6} p={4} bg="green.50" borderRadius="md">
          <Text fontWeight="bold">Asset Supply created successfully!</Text>
          <VStack align="stretch" spacing={3} mt={2}>
            <Text>
              <strong>Asset ID:</strong> {assetId}
            </Text>
            <Text>
              <strong>Asset Type:</strong> {assetType}
            </Text>
            <Text>
              <strong>Maximum Supply:</strong> {maximumSupply}
            </Text>
            <Text>
              <strong>Available Supply:</strong> {availableSupply}
            </Text>
            <Box>
              <Text fontWeight="medium" mb={2}>
                Response Details:
              </Text>
              <Box
                p={3}
                bg="white"
                borderRadius="md"
                maxH="200px"
                overflowY="auto"
              >
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </Box>
            </Box>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

// Mint Asset Panel Component
interface MintAssetPanelProps {
  partyId: string;
  PARTY_IDS: { label: string; value: string }[];
  toast: any;
}

const MintAssetPanel: React.FC<MintAssetPanelProps> = ({
  partyId,
  PARTY_IDS,
  toast,
}) => {
  const [ownerId, setOwnerId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [assetType, setAssetType] = useState('WEARABLE');
  const [metadataPartyId, setMetadataPartyId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [experienceId, setExperienceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOwnerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerId(e.target.value);
  };

  const handleAssetIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssetId(e.target.value);
  };

  const handleAssetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAssetType(e.target.value);
  };

  const handleMetadataPartyIdChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setMetadataPartyId(e.target.value);
  };

  const handleOrgIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrgId(e.target.value);
  };

  const handleExperienceIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExperienceId(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!ownerId.trim()) {
      setError('Owner ID is required');
      return;
    }

    if (!assetId.trim()) {
      setError('Asset ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await mintAsset(
        assetId,
        ownerId,
        partyId,
        metadataPartyId,
        orgId,
        experienceId || undefined,
        assetType,
      );

      setResult(response);
      toast({
        title: 'Asset Minted',
        description: `Successfully minted asset ${assetId} to owner ${ownerId}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Failed to mint asset:', err);
      setError(`Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Stack spacing={4} mb={8}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Text fontSize="lg" fontWeight="bold">
              Mint Asset to User Inventory
            </Text>

            <Flex gap={4} wrap="wrap">
              <FormControl isRequired maxW="300px">
                <FormLabel>Owner ID</FormLabel>
                <Input
                  type="text"
                  value={ownerId}
                  onChange={handleOwnerIdChange}
                  placeholder="Enter owner ID"
                />
              </FormControl>

              <FormControl isRequired maxW="300px">
                <FormLabel>Asset ID</FormLabel>
                <Input
                  type="text"
                  value={assetId}
                  onChange={handleAssetIdChange}
                  placeholder="Enter asset ID"
                />
              </FormControl>

              <FormControl maxW="200px">
                <FormLabel>Asset Type</FormLabel>
                <Select value={assetType} onChange={handleAssetTypeChange}>
                  <option value="">Select Asset Type</option>
                  <option value="WEARABLE">WEARABLE</option>
                  <option value="DECOR">DECOR</option>
                  <option value="AVATAR">AVATAR</option>
                </Select>
              </FormControl>
            </Flex>

            <Flex gap={4} wrap="wrap">
              <FormControl maxW="300px">
                <FormLabel>Party ID (Metadata)</FormLabel>
                <Input
                  type="text"
                  value={metadataPartyId}
                  onChange={handleMetadataPartyIdChange}
                  placeholder="Optional party ID for metadata"
                />
              </FormControl>

              <FormControl maxW="300px">
                <FormLabel>Organization ID</FormLabel>
                <Input
                  type="text"
                  value={orgId}
                  onChange={handleOrgIdChange}
                  placeholder="Optional organization ID"
                />
              </FormControl>

              <FormControl maxW="300px">
                <FormLabel>Experience ID</FormLabel>
                <Input
                  type="text"
                  value={experienceId}
                  onChange={handleExperienceIdChange}
                  placeholder="Optional experience ID"
                />
              </FormControl>
            </Flex>

            <Box>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                loadingText="Minting..."
              >
                Mint Asset
              </Button>
            </Box>
          </Stack>
        </form>
      </Stack>

      {error && (
        <Box
          p={4}
          mb={4}
          bg="red.50"
          color="red.800"
          borderRadius="md"
          borderLeft="4px"
          borderLeftColor="red.500"
        >
          {error}
        </Box>
      )}

      {result && (
        <Box
          p={4}
          bg="green.50"
          borderRadius="md"
          borderLeft="4px"
          borderLeftColor="green.500"
        >
          <Text fontWeight="bold" color="green.800" mb={2}>
            Mint Success!
          </Text>
          <Box overflowX="auto">
            <pre
              style={{
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap',
                color: 'var(--chakra-colors-green-700)',
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
};

// Burn Asset Instance Panel Component
interface BurnAssetInstancePanelProps {
  partyId: string;
  PARTY_IDS: { label: string; value: string }[];
  toast: any;
}

// V2 Inventory Panel Components
interface InventoryV2PanelProps {
  partyId: string;
  PARTY_IDS: Array<{ label: string; value: string }>;
  toast: any;
}

const GearInventoryPanel: React.FC<InventoryV2PanelProps> = ({
  partyId,
  PARTY_IDS,
  toast,
}) => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [gearData, setGearData] = useState<any[]>([]);
  const [appId, setAppId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    [],
  );
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [limit] = useState(25);
  const [nextCursor, setNextCursor] = useState('');
  const [previousCursors, setPreviousCursors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleGetGearInventory = async (
    cursor?: string,
    isNavigating?: 'next' | 'prev',
  ) => {
    if (!userId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a user ID',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await getInventoryV2Gear(userId, partyId, {
        appId: appId || undefined,
        orgId: orgId || undefined,
        category:
          selectedCategories.length > 0 ? selectedCategories : undefined,
        subcategory:
          selectedSubcategories.length > 0 ? selectedSubcategories : undefined,
        color: selectedColors.length > 0 ? selectedColors : undefined,
        nextCursor: cursor || undefined,
        limit,
      });
      setGearData(response.gear || []);
      setNextCursor(response.nextCursor || '');

      toast({
        title: 'Success! 🎮',
        description: `Fetched ${response.gear?.length || 0} gear items`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Update pagination state after successful fetch
      if (isNavigating === 'next' && cursor) {
        setPreviousCursors((prev) => [...prev, cursor]);
        setCurrentPage((prev) => prev + 1);
      } else if (isNavigating === 'prev') {
        const newCursors = [...previousCursors];
        newCursors.pop();
        setPreviousCursors(newCursors);
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch gear inventory: ${error.message}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (nextCursor) {
      handleGetGearInventory(nextCursor, 'next');
    }
  };

  const handlePreviousPage = () => {
    if (previousCursors.length > 0) {
      const previousCursor =
        previousCursors.length > 1
          ? previousCursors[previousCursors.length - 2]
          : '';
      handleGetGearInventory(previousCursor, 'prev');
    }
  };

  const handleResetPagination = () => {
    setNextCursor('');
    setPreviousCursors([]);
    setCurrentPage(1);
    handleGetGearInventory();
  };

  return (
    <Stack spacing={4}>
      <FormControl>
        <FormLabel>User ID</FormLabel>
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
        />
      </FormControl>

      <FormControl>
        <FormLabel>App ID (optional)</FormLabel>
        <Input
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          placeholder="Filter by app ID (e.g., someGame)"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Org ID (optional)</FormLabel>
        <Input
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          placeholder="Filter by organization ID"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Categories (optional)</FormLabel>
        <Input
          placeholder="Enter gear categories separated by commas (e.g., clothing, accessories, shoes)"
          value={selectedCategories.join(', ')}
          onChange={(e) =>
            setSelectedCategories(
              e.target.value
                .split(',')
                .map((cat) => cat.trim())
                .filter((cat) => cat.length > 0),
            )
          }
        />
      </FormControl>

      <FormControl>
        <FormLabel>Subcategories (optional)</FormLabel>
        <Input
          placeholder="Enter subcategories separated by commas (e.g., tops, bottoms, hats)"
          value={selectedSubcategories.join(', ')}
          onChange={(e) =>
            setSelectedSubcategories(
              e.target.value
                .split(',')
                .map((sub) => sub.trim())
                .filter((sub) => sub.length > 0),
            )
          }
        />
      </FormControl>

      <FormControl>
        <FormLabel>Colors (optional)</FormLabel>
        <Input
          placeholder="Enter colors separated by commas (e.g., red, blue, black)"
          value={selectedColors.join(', ')}
          onChange={(e) =>
            setSelectedColors(
              e.target.value
                .split(',')
                .map((color) => color.trim())
                .filter((color) => color.length > 0),
            )
          }
        />
      </FormControl>

      <HStack spacing={4}>
        <Button
          colorScheme="blue"
          onClick={handleResetPagination}
          isLoading={loading}
          loadingText="Fetching..."
        >
          Get Gear Inventory
        </Button>
      </HStack>

      {gearData.length > 0 && (
        <Box mt={4} p={4} borderWidth="1px" borderRadius="md">
          <HStack justify="space-between" mb={4}>
            <Text fontWeight="bold">
              Gear Results ({gearData.length} items)
            </Text>
            <HStack spacing={3}>
              <Badge colorScheme="blue" variant="subtle" fontSize="sm">
                Page {currentPage} • {gearData.length} items
              </Badge>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme="gray"
                  variant="outline"
                  onClick={handlePreviousPage}
                  isDisabled={currentPage === 1 || loading}
                  leftIcon={<Text>←</Text>}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleNextPage}
                  isDisabled={!nextCursor || loading}
                  isLoading={loading}
                  loadingText="Loading..."
                  rightIcon={<Text>→</Text>}
                >
                  Next
                </Button>
              </HStack>
            </HStack>
          </HStack>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Item Name</Th>
                  <Th>Asset ID</Th>
                  <Th>Instance ID</Th>
                  <Th>Category</Th>
                  <Th>Subcategory</Th>
                  <Th>Colors</Th>
                  <Th>Created</Th>
                </Tr>
              </Thead>
              <Tbody>
                {gearData.map((item, index) => (
                  <Tr key={item.assetInstanceId || index}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                          {item.asset?.name || 'Unnamed Item'}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Code fontSize="xs">{item.asset?.assetId || '-'}</Code>
                    </Td>
                    <Td>
                      <Code fontSize="xs">{item.assetInstanceId || '-'}</Code>
                    </Td>
                    <Td>
                      {item.asset?.category ? (
                        <Badge colorScheme="purple" fontSize="xs">
                          {item.asset.category}
                        </Badge>
                      ) : (
                        <Text fontSize="xs">-</Text>
                      )}
                    </Td>
                    <Td>
                      {item.asset?.subcategory ? (
                        <Badge colorScheme="cyan" fontSize="xs">
                          {item.asset.subcategory}
                        </Badge>
                      ) : (
                        <Text fontSize="xs">-</Text>
                      )}
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        {item.asset?.colorTags
                          ?.slice(0, 3)
                          .map((color: string, idx: number) => (
                            <Badge key={idx} colorScheme="pink" fontSize="xs">
                              {color}
                            </Badge>
                          ))}
                        {item.asset?.colorTags?.length > 3 && (
                          <Text fontSize="xs" color="gray.500">
                            +{item.asset.colorTags.length - 3}
                          </Text>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="xs">
                        {item.dateCreated
                          ? new Date(
                              item.dateCreated * 1000,
                            ).toLocaleDateString()
                          : '-'}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Stack>
  );
};

const AvatarComponentsPanel: React.FC<InventoryV2PanelProps> = ({
  partyId,
  PARTY_IDS,
  toast,
}) => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState('dna');
  const [componentData, setComponentData] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [limit] = useState(25);
  const [nextCursor, setNextCursor] = useState('');
  const [previousCursors, setPreviousCursors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const componentOptions = [
    {
      value: 'dna',
      label: 'Avatar Base',
      endpoint: getInventoryV2AvatarBase,
      property: 'avatarBase',
    },
    {
      value: 'eyes',
      label: 'Avatar Eyes',
      endpoint: getInventoryV2AvatarEyes,
      property: 'avatarEyes',
    },
    {
      value: 'flair',
      label: 'Avatar Flair',
      endpoint: getInventoryV2AvatarFlair,
      property: 'avatarFlair',
    },
    {
      value: 'makeup',
      label: 'Avatar Makeup',
      endpoint: getInventoryV2AvatarMakeup,
      property: 'avatarMakeup',
    },
    {
      value: 'colorPresets',
      label: 'Color Presets',
      endpoint: getInventoryV2ColorPresets,
      property: 'colorPresets',
    },
  ];

  const handleGetAvatarComponent = async (
    cursor?: string,
    isNavigating?: 'next' | 'prev',
  ) => {
    if (!userId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a user ID',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const selected = componentOptions.find(
        (opt) => opt.value === selectedComponent,
      );
      if (!selected) return;

      const response = await selected.endpoint(userId, partyId, {
        limit,
        nextCursor: cursor || undefined,
        category:
          selectedCategories.length > 0 ? selectedCategories : undefined,
        color: selectedColors.length > 0 ? selectedColors : undefined,
      });
      setComponentData(response[selected.property] || []);
      setNextCursor(response.nextCursor || '');

      toast({
        title: 'Success',
        description: `Fetched ${
          response[selected.property]?.length || 0
        } ${selected.label.toLowerCase()} items`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Update pagination state after successful fetch
      if (isNavigating === 'next' && cursor) {
        setPreviousCursors((prev) => [...prev, cursor]);
        setCurrentPage((prev) => prev + 1);
      } else if (isNavigating === 'prev') {
        const newCursors = [...previousCursors];
        newCursors.pop();
        setPreviousCursors(newCursors);
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch avatar components: ${error.message}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextPageComponent = () => {
    if (nextCursor) {
      handleGetAvatarComponent(nextCursor, 'next');
    }
  };

  const handlePreviousPageComponent = () => {
    if (previousCursors.length > 0) {
      const previousCursor =
        previousCursors.length > 1
          ? previousCursors[previousCursors.length - 2]
          : '';
      handleGetAvatarComponent(previousCursor, 'prev');
    }
  };

  const handleResetPaginationComponent = () => {
    setNextCursor('');
    setPreviousCursors([]);
    setCurrentPage(1);
    handleGetAvatarComponent();
  };

  return (
    <Stack spacing={4}>
      <FormControl>
        <FormLabel>User ID</FormLabel>
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Avatar Component Type</FormLabel>
        <Select
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
        >
          {componentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Categories (optional)</FormLabel>
        <Input
          placeholder="Enter categories separated by commas"
          value={selectedCategories.join(', ')}
          onChange={(e) =>
            setSelectedCategories(
              e.target.value
                .split(',')
                .map((cat) => cat.trim())
                .filter((cat) => cat.length > 0),
            )
          }
        />
      </FormControl>

      <FormControl>
        <FormLabel>Colors (optional)</FormLabel>
        <Input
          placeholder="Enter colors separated by commas (e.g., red, blue, black)"
          value={selectedColors.join(', ')}
          onChange={(e) =>
            setSelectedColors(
              e.target.value
                .split(',')
                .map((color) => color.trim())
                .filter((color) => color.length > 0),
            )
          }
        />
      </FormControl>

      <HStack spacing={4}>
        <Button
          colorScheme="blue"
          onClick={handleResetPaginationComponent}
          isLoading={loading}
          loadingText="Fetching..."
        >
          Get Avatar Components
        </Button>
      </HStack>

      {componentData.length > 0 && (
        <Box mt={4} p={4} borderWidth="1px" borderRadius="md">
          <HStack justify="space-between" mb={4}>
            <Text fontWeight="bold">
              Results ({componentData.length} items)
            </Text>
            <HStack spacing={3}>
              <Badge colorScheme="blue" variant="subtle" fontSize="sm">
                Page {currentPage} • {componentData.length} items
              </Badge>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme="gray"
                  variant="outline"
                  onClick={handlePreviousPageComponent}
                  isDisabled={currentPage === 1 || loading}
                  leftIcon={<Text>←</Text>}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleNextPageComponent}
                  isDisabled={!nextCursor || loading}
                  isLoading={loading}
                  loadingText="Loading..."
                  rightIcon={<Text>→</Text>}
                >
                  Next
                </Button>
              </HStack>
            </HStack>
          </HStack>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Item Name</Th>
                  <Th>Asset ID</Th>
                  <Th>Instance ID</Th>
                  <Th>Type</Th>
                  <Th>Category</Th>
                  <Th>Colors</Th>
                  <Th>Created</Th>
                </Tr>
              </Thead>
              <Tbody>
                {componentData.map((item, index) => (
                  <Tr key={item.assetInstanceId || index}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                          {item.asset?.name || 'Unnamed Item'}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Code fontSize="xs">{item.asset?.assetId || '-'}</Code>
                    </Td>
                    <Td>
                      <Code fontSize="xs">{item.assetInstanceId || '-'}</Code>
                    </Td>
                    <Td>
                      {item.asset?.assetType ? (
                        <Badge colorScheme="blue" fontSize="xs">
                          {item.asset.assetType}
                        </Badge>
                      ) : (
                        <Text fontSize="xs">-</Text>
                      )}
                    </Td>
                    <Td>
                      {item.asset?.category ? (
                        <Badge colorScheme="purple" fontSize="xs">
                          {item.asset.category}
                        </Badge>
                      ) : (
                        <Text fontSize="xs">-</Text>
                      )}
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        {item.asset?.colorTags
                          ?.slice(0, 3)
                          .map((color: string, idx: number) => (
                            <Badge key={idx} colorScheme="pink" fontSize="xs">
                              {color}
                            </Badge>
                          ))}
                        {item.asset?.colorTags?.length > 3 && (
                          <Text fontSize="xs" color="gray.500">
                            +{item.asset.colorTags.length - 3}
                          </Text>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="xs">
                        {item.dateCreated
                          ? new Date(
                              item.dateCreated * 1000,
                            ).toLocaleDateString()
                          : '-'}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Stack>
  );
};

const MediaLibrariesPanel: React.FC<InventoryV2PanelProps> = ({
  partyId,
  PARTY_IDS,
  toast,
}) => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState('animation');
  const [libraryData, setLibraryData] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [limit] = useState(25);
  const [nextCursor, setNextCursor] = useState('');
  const [previousCursors, setPreviousCursors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const libraryOptions = [
    {
      value: 'animation',
      label: 'Animation Library',
      endpoint: getInventoryV2AnimationLibrary,
      property: 'animationLibrary',
    },
    {
      value: 'image',
      label: 'Image Library',
      endpoint: getInventoryV2ImageLibrary,
      property: 'imageLibrary',
    },
    {
      value: 'model',
      label: 'Model Library',
      endpoint: getInventoryV2ModelLibrary,
      property: 'modelLibrary',
    },
  ];

  const handleGetLibrary = async (
    cursor?: string,
    isNavigating?: 'next' | 'prev',
  ) => {
    if (!userId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a user ID',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const selected = libraryOptions.find(
        (opt) => opt.value === selectedLibrary,
      );
      if (!selected) return;

      const response = await selected.endpoint(userId, partyId, {
        limit,
        nextCursor: cursor || undefined,
        category:
          selectedCategories.length > 0 ? selectedCategories : undefined,
        color: selectedColors.length > 0 ? selectedColors : undefined,
      });
      setLibraryData(response[selected.property] || []);
      setNextCursor(response.nextCursor || '');

      toast({
        title: 'Success',
        description: `Fetched ${
          response[selected.property]?.length || 0
        } ${selected.label.toLowerCase()} items`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Update pagination state after successful fetch
      if (isNavigating === 'next' && cursor) {
        setPreviousCursors((prev) => [...prev, cursor]);
        setCurrentPage((prev) => prev + 1);
      } else if (isNavigating === 'prev') {
        const newCursors = [...previousCursors];
        newCursors.pop();
        setPreviousCursors(newCursors);
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch media library: ${error.message}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextPageLibrary = () => {
    if (nextCursor) {
      handleGetLibrary(nextCursor, 'next');
    }
  };

  const handlePreviousPageLibrary = () => {
    if (previousCursors.length > 0) {
      const previousCursor =
        previousCursors.length > 1
          ? previousCursors[previousCursors.length - 2]
          : '';
      handleGetLibrary(previousCursor, 'prev');
    }
  };

  const handleResetPaginationLibrary = () => {
    setNextCursor('');
    setPreviousCursors([]);
    setCurrentPage(1);
    handleGetLibrary();
  };

  return (
    <Stack spacing={4}>
      <FormControl>
        <FormLabel>User ID</FormLabel>
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Library Type</FormLabel>
        <Select
          value={selectedLibrary}
          onChange={(e) => setSelectedLibrary(e.target.value)}
        >
          {libraryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Categories (optional)</FormLabel>
        <Input
          placeholder="Enter categories separated by commas (e.g., dance, idle, walk)"
          value={selectedCategories.join(', ')}
          onChange={(e) =>
            setSelectedCategories(
              e.target.value
                .split(',')
                .map((cat) => cat.trim())
                .filter((cat) => cat.length > 0),
            )
          }
        />
      </FormControl>

      <FormControl>
        <FormLabel>Colors (optional)</FormLabel>
        <Input
          placeholder="Enter colors separated by commas (e.g., red, blue, black)"
          value={selectedColors.join(', ')}
          onChange={(e) =>
            setSelectedColors(
              e.target.value
                .split(',')
                .map((color) => color.trim())
                .filter((color) => color.length > 0),
            )
          }
        />
      </FormControl>

      <HStack spacing={4}>
        <Button
          colorScheme="blue"
          onClick={handleResetPaginationLibrary}
          isLoading={loading}
          loadingText="Fetching..."
        >
          Get Media Library
        </Button>
      </HStack>

      {libraryData.length > 0 && (
        <Box mt={4} p={4} borderWidth="1px" borderRadius="md">
          <HStack justify="space-between" mb={4}>
            <Text fontWeight="bold">Results ({libraryData.length} items)</Text>
            <HStack spacing={3}>
              <Badge colorScheme="blue" variant="subtle" fontSize="sm">
                Page {currentPage} • {libraryData.length} items
              </Badge>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme="gray"
                  variant="outline"
                  onClick={handlePreviousPageLibrary}
                  isDisabled={currentPage === 1 || loading}
                  leftIcon={<Text>←</Text>}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleNextPageLibrary}
                  isDisabled={!nextCursor || loading}
                  isLoading={loading}
                  loadingText="Loading..."
                  rightIcon={<Text>→</Text>}
                >
                  Next
                </Button>
              </HStack>
            </HStack>
          </HStack>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Item Name</Th>
                  <Th>Asset ID</Th>
                  <Th>Instance ID</Th>
                  <Th>Type</Th>
                  <Th>Category</Th>
                  <Th>Colors</Th>
                  <Th>Created</Th>
                </Tr>
              </Thead>
              <Tbody>
                {libraryData.map((item, index) => (
                  <Tr key={item.assetInstanceId || index}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                          {item.asset?.name || 'Unnamed Item'}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Code fontSize="xs">{item.asset?.assetId || '-'}</Code>
                    </Td>
                    <Td>
                      <Code fontSize="xs">{item.assetInstanceId || '-'}</Code>
                    </Td>
                    <Td>
                      {item.asset?.assetType ? (
                        <Badge colorScheme="blue" fontSize="xs">
                          {item.asset.assetType}
                        </Badge>
                      ) : (
                        <Text fontSize="xs">-</Text>
                      )}
                    </Td>
                    <Td>
                      {item.asset?.category ? (
                        <Badge colorScheme="purple" fontSize="xs">
                          {item.asset.category}
                        </Badge>
                      ) : (
                        <Text fontSize="xs">-</Text>
                      )}
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        {item.asset?.colorTags
                          ?.slice(0, 3)
                          .map((color: string, idx: number) => (
                            <Badge key={idx} colorScheme="pink" fontSize="xs">
                              {color}
                            </Badge>
                          ))}
                        {item.asset?.colorTags?.length > 3 && (
                          <Text fontSize="xs" color="gray.500">
                            +{item.asset.colorTags.length - 3}
                          </Text>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="xs">
                        {item.dateCreated
                          ? new Date(
                              item.dateCreated * 1000,
                            ).toLocaleDateString()
                          : '-'}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Stack>
  );
};

const BurnAssetInstancePanel: React.FC<BurnAssetInstancePanelProps> = ({
  partyId,
  PARTY_IDS,
  toast,
}) => {
  const [assetInstanceIds, setAssetInstanceIds] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();

  const handleAssetInstanceIdChange = (index: number, value: string) => {
    const newAssetInstanceIds = [...assetInstanceIds];
    newAssetInstanceIds[index] = value;
    setAssetInstanceIds(newAssetInstanceIds);
  };

  const addAssetInstanceIdField = () => {
    setAssetInstanceIds([...assetInstanceIds, '']);
  };

  const removeAssetInstanceIdField = (index: number) => {
    if (assetInstanceIds.length > 1) {
      const newAssetInstanceIds = assetInstanceIds.filter(
        (_, i) => i !== index,
      );
      setAssetInstanceIds(newAssetInstanceIds);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty asset instance IDs
    const validAssetInstanceIds = assetInstanceIds.filter(
      (id) => id.trim() !== '',
    );

    if (validAssetInstanceIds.length === 0) {
      setError('Please enter at least one asset instance ID');
      return;
    }

    onConfirmOpen();
  };

  const handleConfirmBurn = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults([]);

      // Filter out empty asset instance IDs
      const validAssetInstanceIds = assetInstanceIds.filter(
        (id) => id.trim() !== '',
      );

      // Use burnAssetInstance for each asset instance ID
      const burnPromises = validAssetInstanceIds.map((instanceId) =>
        burnAssetInstance(instanceId, partyId),
      );

      const responses = await Promise.allSettled(burnPromises);

      const burnResults = responses.map((result, index) => ({
        assetInstanceId: validAssetInstanceIds[index],
        success: result.status === 'fulfilled' && result.value?.success,
        error: result.status === 'rejected' ? result.reason?.message : null,
        response: result.status === 'fulfilled' ? result.value : null,
      }));

      setResults(burnResults);

      const successCount = burnResults.filter((r) => r.success).length;
      const failedCount = burnResults.filter((r) => !r.success).length;

      if (successCount > 0) {
        toast({
          title: 'Success',
          description: `Successfully burned ${successCount} asset instance(s)`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      if (failedCount > 0) {
        toast({
          title:
            failedCount === validAssetInstanceIds.length
              ? 'Error'
              : 'Partial Success',
          description: `Failed to burn ${failedCount} asset instance(s)`,
          status:
            failedCount === validAssetInstanceIds.length ? 'error' : 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to burn asset instances:', error);
      setError(`Error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
      onConfirmClose();
    }
  };

  return (
    <React.Fragment>
      <Stack spacing={4} mb={8}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Text fontSize="lg" fontWeight="bold">
              Burn Asset Instances
            </Text>

            <Text fontSize="sm" color="gray.600">
              Enter the asset instance IDs you want to burn/delete. This action
              cannot be undone.
            </Text>

            <Box>
              <FormLabel>Asset Instance IDs</FormLabel>
              {assetInstanceIds.map((assetInstanceId, index) => (
                <Flex key={index} gap={2} mb={2} align="center">
                  <FormControl isRequired>
                    <Input
                      type="text"
                      value={assetInstanceId}
                      onChange={(e) =>
                        handleAssetInstanceIdChange(index, e.target.value)
                      }
                      placeholder="Enter asset instance ID"
                    />
                  </FormControl>
                  {assetInstanceIds.length > 1 && (
                    <IconButton
                      aria-label="Remove asset instance ID"
                      icon={<span>❌</span>}
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAssetInstanceIdField(index)}
                    />
                  )}
                </Flex>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={addAssetInstanceIdField}
                mt={2}
              >
                Add Another Asset Instance ID
              </Button>
            </Box>

            <Box>
              <Button
                type="submit"
                colorScheme="red"
                isLoading={loading}
                loadingText="Burning..."
              >
                Burn Asset Instances
              </Button>
            </Box>
          </Stack>
        </form>
      </Stack>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
        leastDestructiveRef={undefined}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Asset Instance Burn
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to burn{' '}
              {assetInstanceIds.filter((id) => id.trim() !== '').length} asset
              instance(s)?
              <br />
              <br />
              <strong>This action cannot be undone.</strong>
              <br />
              <br />
              Asset Instance IDs to burn:
              <UnorderedList mt={2}>
                {assetInstanceIds
                  .filter((id) => id.trim() !== '')
                  .map((id, index) => (
                    <ListItem key={index}>
                      <Code fontSize="sm">{id}</Code>
                    </ListItem>
                  ))}
              </UnorderedList>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onConfirmClose}>Cancel</Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmBurn}
                ml={3}
                isLoading={loading}
              >
                Burn
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {error && (
        <Box
          p={4}
          mb={4}
          bg="red.50"
          color="red.800"
          borderRadius="md"
          borderLeft="4px"
          borderLeftColor="red.500"
        >
          {error}
        </Box>
      )}

      {results.length > 0 && (
        <Box
          p={4}
          bg="blue.50"
          borderRadius="md"
          borderLeft="4px"
          borderLeftColor="blue.500"
        >
          <Text fontWeight="bold" color="blue.800" mb={2}>
            Burn Operation Results
          </Text>
          <Stack spacing={2}>
            {results.map((result, index) => (
              <Box
                key={index}
                p={3}
                borderRadius="md"
                bg={result.success ? 'green.100' : 'red.100'}
                borderLeft="4px"
                borderLeftColor={result.success ? 'green.500' : 'red.500'}
              >
                <Text
                  fontWeight="medium"
                  color={result.success ? 'green.800' : 'red.800'}
                >
                  {result.assetInstanceId}:{' '}
                  {result.success ? 'Success' : 'Failed'}
                </Text>
                {result.error && (
                  <Text fontSize="sm" color="red.600" mt={1}>
                    Error: {result.error}
                  </Text>
                )}
                {result.response && (
                  <Box mt={2}>
                    <pre
                      style={{
                        fontSize: '0.7rem',
                        whiteSpace: 'pre-wrap',
                        color: result.success
                          ? 'var(--chakra-colors-green-700)'
                          : 'var(--chakra-colors-red-700)',
                      }}
                    >
                      {JSON.stringify(result.response, null, 2)}
                    </pre>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </React.Fragment>
  );
};

// Delete Asset Panel Component
interface DeleteAssetPanelProps {
  partyId: string;
  PARTY_IDS: { label: string; value: string }[];
  toast: any;
}

const DeleteAssetPanel: React.FC<DeleteAssetPanelProps> = ({
  partyId,
  PARTY_IDS,
  toast,
}) => {
  const [assetIds, setAssetIds] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();

  const handleAssetIdChange = (index: number, value: string) => {
    const newAssetIds = [...assetIds];
    newAssetIds[index] = value;
    setAssetIds(newAssetIds);
  };

  const addAssetIdField = () => {
    setAssetIds([...assetIds, '']);
  };

  const removeAssetIdField = (index: number) => {
    if (assetIds.length > 1) {
      const newAssetIds = assetIds.filter((_, i) => i !== index);
      setAssetIds(newAssetIds);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty asset IDs
    const validAssetIds = assetIds.filter((id) => id.trim() !== '');

    if (validAssetIds.length === 0) {
      setError('Please enter at least one asset ID');
      return;
    }

    onConfirmOpen();
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Filter out empty asset IDs
      const validAssetIds = assetIds.filter((id) => id.trim() !== '');

      const response = await deleteAssets(validAssetIds, partyId);

      setResult(response);

      if (response.deletedIds && response.deletedIds.length > 0) {
        toast({
          title: 'Success',
          description: `Successfully deleted ${response.deletedIds.length} asset definition(s)`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      if (response.failedIds && response.failedIds.length > 0) {
        toast({
          title: 'Partial Success',
          description: `Failed to delete ${response.failedIds.length} asset definition(s)`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }

      if (!response.deletedIds?.length && !response.failedIds?.length) {
        setError(
          'No asset definitions were deleted. Please check the asset IDs and try again.',
        );
      }
    } catch (error) {
      console.error('Failed to delete assets:', error);
      setError(`Error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
      onConfirmClose();
    }
  };

  return (
    <React.Fragment>
      <Stack spacing={4} mb={8}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Text fontSize="lg" fontWeight="bold">
              Delete Asset Definitions
            </Text>

            <Text fontSize="sm" color="gray.600">
              Enter the asset definition IDs you want to delete. This action
              cannot be undone.
            </Text>

            <Box>
              <FormLabel>Asset Definition IDs</FormLabel>
              {assetIds.map((assetId, index) => (
                <Flex key={index} gap={2} mb={2} align="center">
                  <FormControl isRequired>
                    <Input
                      type="text"
                      value={assetId}
                      onChange={(e) =>
                        handleAssetIdChange(index, e.target.value)
                      }
                      placeholder="Enter asset definition ID"
                    />
                  </FormControl>
                  {assetIds.length > 1 && (
                    <IconButton
                      aria-label="Remove asset ID"
                      icon={<span>❌</span>}
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAssetIdField(index)}
                    />
                  )}
                </Flex>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={addAssetIdField}
                mt={2}
              >
                Add Another Asset ID
              </Button>
            </Box>

            <Box>
              <Button
                type="submit"
                colorScheme="red"
                isLoading={loading}
                loadingText="Deleting..."
              >
                Delete Assets
              </Button>
            </Box>
          </Stack>
        </form>
      </Stack>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
        leastDestructiveRef={undefined}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Asset Deletion
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete{' '}
              {assetIds.filter((id) => id.trim() !== '').length} asset
              definition(s)?
              <br />
              <br />
              <strong>This action cannot be undone.</strong>
              <br />
              <br />
              Asset IDs to delete:
              <UnorderedList mt={2}>
                {assetIds
                  .filter((id) => id.trim() !== '')
                  .map((id, index) => (
                    <ListItem key={index}>
                      <Code fontSize="sm">{id}</Code>
                    </ListItem>
                  ))}
              </UnorderedList>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onConfirmClose}>Cancel</Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                ml={3}
                isLoading={loading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {error && (
        <Box
          p={4}
          mb={4}
          bg="red.50"
          color="red.800"
          borderRadius="md"
          borderLeft="4px"
          borderLeftColor="red.500"
        >
          {error}
        </Box>
      )}

      {result && (
        <Box
          p={4}
          bg="blue.50"
          borderRadius="md"
          borderLeft="4px"
          borderLeftColor="blue.500"
        >
          <Text fontWeight="bold" color="blue.800" mb={2}>
            Delete Operation Complete
          </Text>
          <Box overflowX="auto">
            <pre
              style={{
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap',
                color: 'var(--chakra-colors-blue-700)',
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
};

const Inventory: NextPage = () => {
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

  const [userId, setUserId] = useState('');
  const [inventory, setInventory] = useState<InventoryAssetInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partyId, setPartyId] = useState(PARTY_IDS[0].value);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [limit, setLimit] = useState(25);

  // Add new state for filters
  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const toast = useToast();

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  const handlePartyIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPartyId(e.target.value);
  };

  const fetchInventory = async (userIdToFetch: string) => {
    try {
      setLoading(true);
      setError(null);

      // Don't fetch if userId is empty
      if (!userIdToFetch.trim()) {
        setError('Please enter a user ID');
        setLoading(false);
        return;
      }

      const response = await getUserInventory(
        userIdToFetch,
        partyId,
        categories.length > 0 ? categories : undefined, // Pass categories array if not empty
        colors.length > 0 ? colors : undefined, // Pass colors array if not empty
        null, // nextCursor
        limit,
      );

      if (response && response.data) {
        setInventory(response.data);
        setNextCursor(response.nextCursor || null);
      } else {
        setInventory([]);
        setNextCursor(null);
        setError('No inventory found or API returned an empty response');
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setError(`Error: ${error.message || 'Unknown error occurred'}`);
      setInventory([]);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchInventory(userId);
  };

  const loadMoreInventory = async () => {
    if (!nextCursor) return;

    try {
      setLoading(true);
      const response = await getUserInventory(
        userId,
        partyId,
        categories.length > 0 ? categories : undefined,
        colors.length > 0 ? colors : undefined,
        nextCursor,
        limit,
      );

      if (response && response.data) {
        setInventory([...inventory, ...response.data]);
        setNextCursor(response.nextCursor || null);
      }
    } catch (error) {
      console.error('Failed to fetch more inventory:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch more inventory: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <Heading mb={6}>Inventory Management</Heading>

      {/* Global Party ID Selection */}
      <Box mb={6} p={4} borderWidth="1px" borderRadius="md" bg="transparent">
        <FormControl id="global-party-id">
          <FormLabel fontWeight="bold">Party ID (Used for all tabs)</FormLabel>
          <Select value={partyId} onChange={handlePartyIdChange}>
            {PARTY_IDS.map((party) => (
              <option key={party.value} value={party.value}>
                {party.label}
              </option>
            ))}
          </Select>
          <Text fontSize="sm" color="gray.600" mt={1}>
            This party ID will be used for all operations in all tabs
          </Text>
        </FormControl>
      </Box>

      <Tabs variant="enclosed" mb={6}>
        <TabList>
          <Tab>User Inventory</Tab>
          <Tab>Metadata Store</Tab>
          <Tab>Metadata Tags</Tab>
          <Tab>Asset Supply</Tab>
          <Tab>Mint Asset</Tab>
          <Tab>Delete Asset Definitions</Tab>
          <Tab>Delete/Burn Asset Instances</Tab>
        </TabList>

        <TabPanels>
          {/* User Inventory Tab */}
          <TabPanel>
            <GetUserInventoryPanel
              userId={userId}
              setUserId={setUserId}
              inventory={inventory}
              setInventory={setInventory}
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
              partyId={partyId}
              setPartyId={setPartyId}
              nextCursor={nextCursor}
              setNextCursor={setNextCursor}
              limit={limit}
              setLimit={setLimit}
              categories={categories}
              setCategories={setCategories}
              colors={colors}
              setColors={setColors}
              PARTY_IDS={PARTY_IDS}
              handleUserIdChange={handleUserIdChange}
              handleSubmit={handleSubmit}
              loadMoreInventory={loadMoreInventory}
              toast={toast}
            />
          </TabPanel>

          {/* Metadata Store Tab */}
          <TabPanel>
            <MetadataStorePanel
              partyId={partyId}
              PARTY_IDS={PARTY_IDS}
              toast={toast}
            />
          </TabPanel>

          {/* Metadata Tags Tab */}
          <TabPanel>
            <MetadataTagsPanel
              partyId={partyId}
              PARTY_IDS={PARTY_IDS}
              toast={toast}
            />
          </TabPanel>

          {/* Asset Supply Tab */}
          <TabPanel>
            <AssetSupplyPanel
              partyId={partyId}
              PARTY_IDS={PARTY_IDS}
              toast={toast}
            />
          </TabPanel>

          {/* Mint Asset Tab */}
          <TabPanel>
            <MintAssetPanel
              partyId={partyId}
              PARTY_IDS={PARTY_IDS}
              toast={toast}
            />
          </TabPanel>

          {/* Delete Asset Definitions Tab */}
          <TabPanel>
            <DeleteAssetPanel
              partyId={partyId}
              PARTY_IDS={PARTY_IDS}
              toast={toast}
            />
          </TabPanel>

          {/* Burn Asset Instances Tab */}
          <TabPanel>
            <BurnAssetInstancePanel
              partyId={partyId}
              PARTY_IDS={PARTY_IDS}
              toast={toast}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* V2 Inventory Section */}
      <Box mt={8} mb={12}>
        <Heading mb={4} size="md">
          V2 Inventory Endpoints
        </Heading>
        <Text mb={6} color="gray.600">
          Enhanced inventory management with categorized data access
        </Text>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Gear & Wearables</Tab>
            <Tab>Avatar Components</Tab>
            <Tab>Media Libraries</Tab>
          </TabList>

          <TabPanels minH="400px">
            {/* Gear & Wearables Tab */}
            <TabPanel>
              <GearInventoryPanel
                partyId={partyId}
                PARTY_IDS={PARTY_IDS}
                toast={toast}
              />
            </TabPanel>

            {/* Avatar Components Tab */}
            <TabPanel>
              <AvatarComponentsPanel
                partyId={partyId}
                PARTY_IDS={PARTY_IDS}
                toast={toast}
              />
            </TabPanel>

            {/* Media Libraries Tab */}
            <TabPanel>
              <MediaLibrariesPanel
                partyId={partyId}
                PARTY_IDS={PARTY_IDS}
                toast={toast}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default Inventory;
