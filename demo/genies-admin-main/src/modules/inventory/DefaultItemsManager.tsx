import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Grid,
  GridItem,
  Tag,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  useToast,
  Heading,
  Divider,
  Badge,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tooltip,
  Wrap,
  WrapItem,
} from 'src/theme';
import {
  getDefaultGear,
  getDefaultDecor,
  getDefaultAvatar,
  getDefaultAvatarBase,
  getDefaultAvatarMakeup,
  getDefaultAvatarFlair,
  getDefaultAvatarEyes,
  getDefaultColorPresets,
  getDefaultImageLibrary,
  getDefaultAnimationLibrary,
  getDefaultModelLibrary,
} from 'src/edge/shim/inventory';
import {
  GetInventoryV2GearResponse,
  GetInventoryV2DecorResponse,
  GetInventoryV2AvatarBaseResponse,
  GetInventoryV2AvatarMakeupResponse,
  GetInventoryV2AvatarFlairResponse,
  GetInventoryV2AvatarEyesResponse,
  GetInventoryV2ColorPresetsResponse,
  GetInventoryV2ImageLibraryResponse,
  GetInventoryV2AnimationLibraryResponse,
  GetInventoryV2ModelLibraryResponse,
} from 'src/lib/swagger/admin';

interface DefaultItemsManagerProps {
  partyId?: string;
}

type AssetType =
  | 'gear'
  | 'decor'
  | 'avatar'
  | 'avatarBase'
  | 'avatarMakeup'
  | 'avatarFlair'
  | 'avatarEyes'
  | 'colorPresets'
  | 'imageLibrary'
  | 'animationLibrary'
  | 'modelLibrary';

interface DefaultItemsState {
  gear: any[];
  decor: any[];
  avatar: any[];
  avatarBase: any[];
  avatarMakeup: any[];
  avatarFlair: any[];
  avatarEyes: any[];
  colorPresets: any[];
  imageLibrary: any[];
  animationLibrary: any[];
  modelLibrary: any[];
}

const DefaultItemsManager: React.FC<DefaultItemsManagerProps> = ({
  partyId,
}) => {
  const [orgId, setOrgId] = useState<string>('');
  const [appId, setAppId] = useState<string>('');
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>('gear');
  const [items, setItems] = useState<DefaultItemsState>({
    gear: [],
    decor: [],
    avatar: [],
    avatarBase: [],
    avatarMakeup: [],
    avatarFlair: [],
    avatarEyes: [],
    colorPresets: [],
    imageLibrary: [],
    animationLibrary: [],
    modelLibrary: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Modal state for viewing item details
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Pagination state
  const [nextCursor, setNextCursor] = useState<string>('');
  const [previousCursors, setPreviousCursors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageLimit] = useState<number>(25); // Items per page

  const assetTypes: { value: AssetType; label: string }[] = [
    { value: 'gear', label: 'Gear/Wearables' },
    { value: 'decor', label: 'Decor Items' },
    { value: 'avatar', label: 'Avatar (Base)' },
    { value: 'avatarBase', label: 'Avatar Base' },
    { value: 'avatarMakeup', label: 'Avatar Makeup' },
    { value: 'avatarFlair', label: 'Avatar Flair' },
    { value: 'avatarEyes', label: 'Avatar Eyes' },
    { value: 'colorPresets', label: 'Color Presets' },
    { value: 'imageLibrary', label: 'Image Library' },
    { value: 'animationLibrary', label: 'Animation Library' },
    { value: 'modelLibrary', label: 'Model Library' },
  ];

  const fetchDefaultItems = async (
    assetType: AssetType,
    cursor?: string,
    isNavigating?: 'next' | 'prev',
  ) => {
    setLoading(true);
    setError(null);

    console.log('Fetching default items:', {
      assetType,
      orgId: orgId || '(empty - will query global)',
      appId: appId || '(empty - will query global)',
      nextCursor: cursor || '(none)',
    });

    try {
      let response;
      switch (assetType) {
        case 'gear':
          response = (await getDefaultGear(orgId, appId, partyId, {
            nextCursor: cursor,
            limit: pageLimit,
          })) as GetInventoryV2GearResponse;
          setItems((prev) => ({ ...prev, gear: response.gear || [] }));
          setNextCursor(response.nextCursor || '');
          break;
        case 'decor':
          response = (await getDefaultDecor(orgId, appId, partyId, {
            nextCursor: cursor,
            limit: pageLimit,
          })) as GetInventoryV2DecorResponse;
          setItems((prev) => ({ ...prev, decor: response.decor || [] }));
          setNextCursor(response.nextCursor || '');
          break;
        case 'avatar':
          response = await getDefaultAvatar(orgId, appId, partyId, {
            nextCursor: cursor,
            limit: pageLimit,
          });
          setItems((prev) => ({ ...prev, avatar: response.avatar || [] }));
          setNextCursor(response.nextCursor || '');
          break;
        case 'avatarBase':
          response = (await getDefaultAvatarBase(orgId, appId, partyId, {
            nextCursor: cursor,
            limit: pageLimit,
          })) as GetInventoryV2AvatarBaseResponse;
          setItems((prev) => ({
            ...prev,
            avatarBase: response.avatarBase || [],
          }));
          setNextCursor(response.nextCursor || '');
          break;
        case 'avatarMakeup':
          response = (await getDefaultAvatarMakeup(orgId, appId, partyId, {
            nextCursor: cursor,
            limit: pageLimit,
          })) as GetInventoryV2AvatarMakeupResponse;
          setItems((prev) => ({
            ...prev,
            avatarMakeup: response.avatarMakeup || [],
          }));
          setNextCursor(response.nextCursor || '');
          break;
        case 'avatarFlair':
          response = (await getDefaultAvatarFlair(orgId, appId, partyId, {
            nextCursor: cursor,
            limit: pageLimit,
          })) as GetInventoryV2AvatarFlairResponse;
          setItems((prev) => ({
            ...prev,
            avatarFlair: response.avatarFlair || [],
          }));
          setNextCursor(response.nextCursor || '');
          break;
        case 'avatarEyes':
          response = (await getDefaultAvatarEyes(orgId, appId, partyId, {
            nextCursor: cursor,
            limit: pageLimit,
          })) as GetInventoryV2AvatarEyesResponse;
          setItems((prev) => ({
            ...prev,
            avatarEyes: response.avatarEyes || [],
          }));
          setNextCursor(response.nextCursor || '');
          break;
        case 'colorPresets':
          response = (await getDefaultColorPresets(orgId, appId, partyId, {
            nextCursor: cursor,
            limit: pageLimit,
          })) as GetInventoryV2ColorPresetsResponse;
          setItems((prev) => ({
            ...prev,
            colorPresets: response.colorPresets || [],
          }));
          setNextCursor(response.nextCursor || '');
          break;
        case 'imageLibrary':
          response = (await getDefaultImageLibrary(orgId, appId, partyId, {
            nextCursor: cursor,
            limit: pageLimit,
          })) as GetInventoryV2ImageLibraryResponse;
          setItems((prev) => ({
            ...prev,
            imageLibrary: response.imageLibrary || [],
          }));
          setNextCursor(response.nextCursor || '');
          break;
        case 'animationLibrary':
          response = (await getDefaultAnimationLibrary(orgId, appId, partyId, {
            nextCursor: cursor,
            limit: pageLimit,
          })) as GetInventoryV2AnimationLibraryResponse;
          setItems((prev) => ({
            ...prev,
            animationLibrary: response.animationLibrary || [],
          }));
          setNextCursor(response.nextCursor || '');
          break;
        case 'modelLibrary':
          response = (await getDefaultModelLibrary(orgId, appId, partyId, {
            nextCursor: cursor,
            limit: pageLimit,
          })) as GetInventoryV2ModelLibraryResponse;
          setItems((prev) => ({
            ...prev,
            modelLibrary: response.modelLibrary || [],
          }));
          setNextCursor(response.nextCursor || '');
          break;
      }

      toast({
        title: 'Success',
        description: `Loaded ${assetType} items successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Only update pagination state after successful fetch
      if (isNavigating === 'next' && cursor) {
        setPreviousCursors((prev) => [...prev, cursor]);
        setCurrentPage((prev) => prev + 1);
      } else if (isNavigating === 'prev') {
        const newCursors = [...previousCursors];
        newCursors.pop();
        setPreviousCursors(newCursors);
        setCurrentPage((prev) => prev - 1);
      }
    } catch (err) {
      const errorMessage = `Failed to fetch ${assetType} items: ${
        err instanceof Error ? err.message : 'Unknown error'
      }`;
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      // Don't update pagination state on error - user can retry or go back
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (nextCursor) {
      // Pagination state will be updated in fetchDefaultItems after successful fetch
      fetchDefaultItems(selectedAssetType, nextCursor, 'next');
    }
  };

  const handlePreviousPage = () => {
    if (previousCursors.length > 0) {
      // Get the cursor for the previous page (the one before the last)
      const previousCursor =
        previousCursors.length > 1
          ? previousCursors[previousCursors.length - 2]
          : '';

      // Pagination state will be updated in fetchDefaultItems after successful fetch
      fetchDefaultItems(selectedAssetType, previousCursor, 'prev');
    }
  };

  const handleResetPagination = () => {
    setNextCursor('');
    setPreviousCursors([]);
    setCurrentPage(1);
    fetchDefaultItems(selectedAssetType);
  };

  const currentItems = items[selectedAssetType] || [];

  // Helper function to render color chips
  const renderColorChips = (colors: string[] | undefined, maxVisible = 3) => {
    if (!colors || colors.length === 0) return <Text fontSize="xs">-</Text>;

    const visibleColors = colors.slice(0, maxVisible);
    const remainingCount = colors.length - maxVisible;

    return (
      <Wrap spacing={1}>
        {visibleColors.map((color, idx) => (
          <WrapItem key={idx}>
            <Tooltip label={color} placement="top">
              <Box
                width="20px"
                height="20px"
                borderRadius="md"
                bg={color}
                border="1px solid"
                borderColor="gray.400"
                cursor="pointer"
              />
            </Tooltip>
          </WrapItem>
        ))}
        {remainingCount > 0 && (
          <WrapItem>
            <Badge colorScheme="gray" fontSize="xs">
              +{remainingCount}
            </Badge>
          </WrapItem>
        )}
      </Wrap>
    );
  };

  // Helper function to truncate text
  const truncate = (text: string | undefined, maxLength = 30) => {
    if (!text) return 'N/A';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Handler to open modal with item details
  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    onOpen();
  };

  return (
    <VStack spacing={6} align="stretch" p={6}>
      <Box>
        <Heading size="lg" mb={2}>
          Default Items Manager
        </Heading>
        <Text color="gray.600" mb={2}>
          Manage default items for organizations and applications.
        </Text>
        <Text color="gray.500" fontSize="sm">
          💡 <strong>Tip:</strong> Leave fields empty OR use &quot;ALL&quot; to
          query global defaults. Use specific values (e.g., &quot;org-123&quot;,
          &quot;avatar-editor&quot;) to query org/app-specific defaults.
        </Text>
      </Box>

      <Box borderWidth={1} borderRadius="lg" p={4} bg="gray.700">
        <VStack spacing={4} align="stretch">
          <Text fontWeight="semibold" color="white">
            Configuration
          </Text>

          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
            <GridItem>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.300">
                  Organization ID
                </FormLabel>
                <Input
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  placeholder="org-genies-123 (or leave empty for ALL)"
                  size="sm"
                  bg="gray.800"
                  color="white"
                  borderColor="gray.600"
                  _placeholder={{ color: 'gray.500' }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.300">
                  Application ID
                </FormLabel>
                <Input
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="avatar-editor (or leave empty for ALL)"
                  size="sm"
                  bg="gray.800"
                  color="white"
                  borderColor="gray.600"
                  _placeholder={{ color: 'gray.500' }}
                />
              </FormControl>
            </GridItem>
          </Grid>

          <Box>
            <Text fontSize="sm" mb={2} fontWeight="medium" color="gray.300">
              Asset Type
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              {assetTypes.map((type) => (
                <Tag
                  key={type.value}
                  size="md"
                  variant={
                    selectedAssetType === type.value ? 'solid' : 'outline'
                  }
                  colorScheme={
                    selectedAssetType === type.value ? 'blue' : 'gray'
                  }
                  cursor="pointer"
                  onClick={() => setSelectedAssetType(type.value)}
                  _hover={{ opacity: 0.8 }}
                >
                  {type.label}
                </Tag>
              ))}
            </HStack>
          </Box>

          <HStack spacing={4}>
            <Button
              colorScheme="blue"
              onClick={handleResetPagination}
              isLoading={loading}
              loadingText="Fetching..."
              size="sm"
            >
              Fetch Items
            </Button>
          </HStack>
        </VStack>
      </Box>

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Box borderWidth={1} borderRadius="lg" p={4}>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">
            {assetTypes.find((t) => t.value === selectedAssetType)?.label} Items
          </Heading>
          <HStack spacing={3}>
            <Badge colorScheme="blue" variant="subtle" fontSize="sm">
              Page {currentPage} • {currentItems.length} items
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

        <Divider mb={4} />

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Category</Th>
                <Th>Colors</Th>
                <Th>Origin</Th>
                <Th>Org/App</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Tr key={index}>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                  </Tr>
                ))
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <Tr key={item.assetInstanceId || index}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Tooltip label={item.asset?.name || 'Unnamed Asset'}>
                          <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                            {truncate(item.asset?.name, 25)}
                          </Text>
                        </Tooltip>
                        <Tooltip label={item.asset?.assetId}>
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            fontFamily="mono"
                            noOfLines={1}
                          >
                            {truncate(item.asset?.assetId, 20)}
                          </Text>
                        </Tooltip>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue" fontSize="xs">
                        {item.asset?.assetType || 'N/A'}
                      </Badge>
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
                    <Td>{renderColorChips(item.asset?.colors)}</Td>
                    <Td>
                      {item.asset?.origin ? (
                        <Badge colorScheme="green" fontSize="xs">
                          {item.asset.origin}
                        </Badge>
                      ) : (
                        <Text fontSize="xs">-</Text>
                      )}
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Tooltip label={item.asset?.orgId || 'N/A'}>
                          <Text fontSize="xs" noOfLines={1}>
                            {truncate(item.asset?.orgId, 15)}
                          </Text>
                        </Tooltip>
                        <Tooltip label={item.asset?.appId || 'N/A'}>
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {truncate(item.asset?.appId, 15)}
                          </Text>
                        </Tooltip>
                      </VStack>
                    </Td>
                    <Td>
                      <Button
                        size="xs"
                        colorScheme="teal"
                        onClick={() => handleViewDetails(item)}
                      >
                        View Details
                      </Button>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={7} textAlign="center">
                    <Text color="gray.500" py={8}>
                      No items found. Try fetching data with valid Organization
                      ID or Application ID.
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Metadata Detail Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
        <ModalContent
          maxH="90vh"
          borderRadius="xl"
          boxShadow="dark-lg"
          bg="gray.900"
        >
          <ModalHeader
            bg="blue.500"
            color="white"
            borderTopRadius="xl"
            py={4}
            px={6}
          >
            <HStack spacing={3}>
              <Text fontSize="lg" fontWeight="bold">
                Item Details
              </Text>
              {selectedItem?.asset?.assetType && (
                <Badge
                  bg="whiteAlpha.300"
                  color="white"
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="md"
                >
                  {selectedItem.asset.assetType}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" size="lg" />
          <ModalBody bg="gray.900" py={6} px={6}>
            {selectedItem && (
              <VStack align="stretch" spacing={5}>
                {/* Basic Info Section */}
                <Box
                  bg="gray.800"
                  p={5}
                  borderRadius="lg"
                  boxShadow="md"
                  borderWidth="1px"
                  borderColor="gray.700"
                >
                  <Heading size="sm" mb={4} color="blue.300">
                    📋 Basic Information
                  </Heading>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={1}
                      >
                        Asset Name
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color="gray.100">
                        {selectedItem.asset?.name || (
                          <Text as="span" color="gray.500" fontStyle="italic">
                            N/A
                          </Text>
                        )}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={1}
                      >
                        Asset ID
                      </Text>
                      <Text
                        fontSize="xs"
                        fontFamily="mono"
                        bg="blue.900"
                        color="blue.200"
                        p={2}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="blue.700"
                      >
                        {selectedItem.asset?.assetId || (
                          <Text as="span" color="gray.500" fontStyle="italic">
                            N/A
                          </Text>
                        )}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={1}
                      >
                        Instance ID
                      </Text>
                      <Text
                        fontSize="xs"
                        fontFamily="mono"
                        bg="purple.900"
                        color="purple.200"
                        p={2}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="purple.700"
                      >
                        {selectedItem.assetInstanceId || (
                          <Text as="span" color="gray.500" fontStyle="italic">
                            N/A
                          </Text>
                        )}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={1}
                      >
                        Asset Type
                      </Text>
                      <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                        {selectedItem.asset?.assetType || 'N/A'}
                      </Badge>
                    </GridItem>
                    <GridItem>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={1}
                      >
                        Creator
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color="gray.100">
                        {selectedItem.asset?.creator || (
                          <Text as="span" color="gray.500" fontStyle="italic">
                            N/A
                          </Text>
                        )}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={1}
                      >
                        Date Created
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color="gray.100">
                        {selectedItem.dateCreated ? (
                          new Date(selectedItem.dateCreated).toLocaleString()
                        ) : (
                          <Text as="span" color="gray.500" fontStyle="italic">
                            N/A
                          </Text>
                        )}
                      </Text>
                    </GridItem>
                  </Grid>
                </Box>

                {/* Ownership Section */}
                <Box
                  bg="gray.800"
                  p={5}
                  borderRadius="lg"
                  boxShadow="md"
                  borderWidth="1px"
                  borderColor="gray.700"
                >
                  <Heading size="sm" mb={4} color="purple.300">
                    🏢 Ownership & Origin
                  </Heading>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={1}
                      >
                        Owner
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color="gray.100">
                        {selectedItem.owner || (
                          <Text as="span" color="gray.500" fontStyle="italic">
                            N/A
                          </Text>
                        )}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={1}
                      >
                        Origin
                      </Text>
                      {selectedItem.asset?.origin ? (
                        <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                          {selectedItem.asset.origin}
                        </Badge>
                      ) : (
                        <Text fontSize="sm" color="gray.500" fontStyle="italic">
                          N/A
                        </Text>
                      )}
                    </GridItem>
                    <GridItem>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={1}
                      >
                        Organization ID
                      </Text>
                      <Text
                        fontSize="xs"
                        fontFamily="mono"
                        bg="orange.900"
                        color="orange.200"
                        p={2}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="orange.700"
                      >
                        {selectedItem.asset?.orgId || (
                          <Text as="span" color="gray.500" fontStyle="italic">
                            N/A
                          </Text>
                        )}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={1}
                      >
                        Application ID
                      </Text>
                      <Text
                        fontSize="xs"
                        fontFamily="mono"
                        bg="teal.900"
                        color="teal.200"
                        p={2}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="teal.700"
                      >
                        {selectedItem.asset?.appId || (
                          <Text as="span" color="gray.500" fontStyle="italic">
                            N/A
                          </Text>
                        )}
                      </Text>
                    </GridItem>
                  </Grid>
                </Box>

                {/* Descriptions Section */}
                <Box
                  bg="gray.800"
                  p={5}
                  borderRadius="lg"
                  boxShadow="md"
                  borderWidth="1px"
                  borderColor="gray.700"
                >
                  <Heading size="sm" mb={4} color="green.300">
                    📝 Descriptions
                  </Heading>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={2}
                      >
                        Description
                      </Text>
                      <Text
                        fontSize="sm"
                        p={3}
                        bg="gray.900"
                        color="gray.200"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.700"
                        lineHeight="tall"
                      >
                        {selectedItem.asset?.description || (
                          <Text as="span" color="gray.500" fontStyle="italic">
                            No description
                          </Text>
                        )}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={2}
                      >
                        Long Description
                      </Text>
                      <Text
                        fontSize="sm"
                        p={3}
                        bg="gray.900"
                        color="gray.200"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.700"
                        lineHeight="tall"
                        maxH="150px"
                        overflowY="auto"
                      >
                        {selectedItem.asset?.longDescription || (
                          <Text as="span" color="gray.500" fontStyle="italic">
                            No long description
                          </Text>
                        )}
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Visual & Category Section */}
                <Box
                  bg="gray.800"
                  p={5}
                  borderRadius="lg"
                  boxShadow="md"
                  borderWidth="1px"
                  borderColor="gray.700"
                >
                  <Heading size="sm" mb={4} color="orange.300">
                    🎨 Visual & Categories
                  </Heading>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={2}
                      >
                        Category
                      </Text>
                      {selectedItem.asset?.category ? (
                        <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                          {selectedItem.asset.category}
                        </Badge>
                      ) : (
                        <Text fontSize="sm" color="gray.500" fontStyle="italic">
                          N/A
                        </Text>
                      )}
                    </Box>
                    {selectedItem.asset?.subcategories &&
                      selectedItem.asset.subcategories.length > 0 && (
                        <Box>
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color="gray.400"
                            mb={2}
                          >
                            Subcategories
                          </Text>
                          <Wrap spacing={2}>
                            {selectedItem.asset.subcategories.map(
                              (sub: string, idx: number) => (
                                <WrapItem key={idx}>
                                  <Badge colorScheme="cyan">{sub}</Badge>
                                </WrapItem>
                              ),
                            )}
                          </Wrap>
                        </Box>
                      )}
                    {selectedItem.asset?.colors &&
                      selectedItem.asset.colors.length > 0 && (
                        <Box>
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color="gray.400"
                            mb={2}
                          >
                            Colors
                          </Text>
                          <Wrap spacing={3}>
                            {selectedItem.asset.colors.map(
                              (color: string, idx: number) => (
                                <WrapItem key={idx}>
                                  <HStack
                                    bg="gray.900"
                                    p={2}
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor="gray.700"
                                    spacing={2}
                                  >
                                    <Box
                                      width="28px"
                                      height="28px"
                                      borderRadius="md"
                                      bg={color}
                                      border="2px solid"
                                      borderColor="gray.600"
                                      boxShadow="sm"
                                    />
                                    <Text
                                      fontSize="xs"
                                      fontFamily="mono"
                                      fontWeight="semibold"
                                      color="gray.200"
                                    >
                                      {color}
                                    </Text>
                                  </HStack>
                                </WrapItem>
                              ),
                            )}
                          </Wrap>
                        </Box>
                      )}
                  </VStack>
                </Box>

                {/* Technical Section */}
                {selectedItem.asset?.pipeline && (
                  <Box
                    bg="gray.800"
                    p={5}
                    borderRadius="lg"
                    boxShadow="md"
                    borderWidth="1px"
                    borderColor="gray.700"
                  >
                    <Heading size="sm" mb={4} color="teal.300">
                      🔧 Technical Information
                    </Heading>
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.400"
                        mb={3}
                      >
                        Pipeline
                      </Text>
                      <Box
                        bg="black"
                        color="green.300"
                        p={4}
                        borderRadius="md"
                        fontSize="xs"
                        fontFamily="mono"
                        whiteSpace="pre-wrap"
                        overflowX="auto"
                        maxH="300px"
                        overflowY="auto"
                        border="1px solid"
                        borderColor="green.800"
                      >
                        {typeof selectedItem.asset.pipeline === 'object'
                          ? JSON.stringify(selectedItem.asset.pipeline, null, 2)
                          : selectedItem.asset.pipeline}
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Animation Library Specific Section */}
                {selectedItem.asset?.assetType === 'AnimationLibrary' &&
                  (selectedItem.asset?.moodsTag ||
                    selectedItem.asset?.protocolTags) && (
                    <Box
                      bg="gray.800"
                      p={5}
                      borderRadius="lg"
                      boxShadow="md"
                      borderWidth="1px"
                      borderColor="gray.700"
                    >
                      <Heading size="sm" mb={4} color="pink.300">
                        🎭 Animation Metadata
                      </Heading>
                      <VStack align="stretch" spacing={4}>
                        {selectedItem.asset.moodsTag && (
                          <Box>
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color="gray.400"
                              mb={2}
                            >
                              Moods Tag
                            </Text>
                            <Badge
                              colorScheme="pink"
                              fontSize="sm"
                              px={3}
                              py={1}
                            >
                              {selectedItem.asset.moodsTag}
                            </Badge>
                          </Box>
                        )}
                        {selectedItem.asset.protocolTags &&
                          selectedItem.asset.protocolTags.length > 0 && (
                            <Box>
                              <Text
                                fontSize="xs"
                                fontWeight="bold"
                                color="gray.400"
                                mb={2}
                              >
                                Protocol Tags
                              </Text>
                              <Wrap spacing={2}>
                                {selectedItem.asset.protocolTags.map(
                                  (tag: string, idx: number) => (
                                    <WrapItem key={idx}>
                                      <Badge colorScheme="red">{tag}</Badge>
                                    </WrapItem>
                                  ),
                                )}
                              </Wrap>
                            </Box>
                          )}
                      </VStack>
                    </Box>
                  )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default DefaultItemsManager;
