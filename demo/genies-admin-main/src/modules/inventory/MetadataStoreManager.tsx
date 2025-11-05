import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tag,
} from 'src/theme';
import {
  getAllMetadataStores,
  createDefaultClosetNamespace,
} from 'src/edge/shim/inventory';
import { MetadataStoreInfo } from 'src/lib/swagger/admin';

interface MetadataStoreManagerProps {
  partyId?: string;
}

const MetadataStoreManager: React.FC<MetadataStoreManagerProps> = ({
  partyId,
}) => {
  const [stores, setStores] = useState<MetadataStoreInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [pagesFetched, setPagesFetched] = useState(0);
  const toast = useToast();

  // Modal states
  const {
    isOpen: isCreateNamespaceOpen,
    onOpen: onCreateNamespaceOpen,
    onClose: onCreateNamespaceClose,
  } = useDisclosure();

  const fetchStores = useCallback(
    async (cursor?: string, currentPageCount: number = 0) => {
      setLoading(true);
      setError(null);

      // Safety limit to prevent infinite loops
      const MAX_PAGES = 50;
      if (currentPageCount >= MAX_PAGES) {
        console.warn('Reached maximum page limit, stopping pagination');
        setLoading(false);
        toast({
          title: 'Warning',
          description: `Loaded stores from ${MAX_PAGES} pages. There may be more available.`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      try {
        const response = await getAllMetadataStores({
          limit: 100,
          nextCursor: cursor,
        });

        const newPageCount = currentPageCount + 1;
        setPagesFetched(newPageCount);

        if (cursor) {
          // Appending more results
          setStores((prev) => [...prev, ...(response.stores || [])]);
        } else {
          // Initial load
          setStores(response.stores || []);
        }

        setNextCursor(response.nextCursor);
        setHasMore(!!response.nextCursor);

        // Show appropriate message based on results
        if (response.stores && response.stores.length > 0) {
          toast({
            title: 'Success',
            description: `Loaded ${response.stores.length} metadata stores`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else if (!response.nextCursor) {
          toast({
            title: 'No Stores Found',
            description: 'No metadata stores exist yet',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch stores';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  const handleCreateNamespace = async () => {
    try {
      const response = await createDefaultClosetNamespace();
      toast({
        title: response.alreadyExists ? 'Already Exists' : 'Success',
        description: response.message,
        status: response.alreadyExists ? 'info' : 'success',
        duration: 5000,
        isClosable: true,
      });
      onCreateNamespaceClose();
      fetchStores();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to create default closet namespace';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return (
    <VStack spacing={6} align="stretch" p={6}>
      <Box>
        <Heading size="lg" mb={2}>
          Metadata Store Manager
        </Heading>
        <Text color="gray.600" mb={2}>
          Manage metadata stores and create default items
        </Text>
        <Box
          bg="blue.900"
          p={3}
          borderRadius="md"
          borderLeft="4px"
          borderLeftColor="blue.400"
        >
          <Text fontSize="sm" fontWeight="medium" mb={1} color="blue.100">
            Default Items System:
          </Text>
          <Text fontSize="xs" color="blue.200">
            • <strong>tag_defaultCloset</strong>: Core namespace for default
            items (orgId, appId, isDefault fields)
            <br />• Create default items by tagging asset supplies with this
            namespace
            <br />• Use &quot;ALL&quot; for orgId/appId to create global default
            items
            <br />• Supports all asset types: gear, avatar_base, avatar_makeup,
            etc.
          </Text>
        </Box>
      </Box>

      <HStack spacing={4} flexWrap="wrap">
        <Button colorScheme="blue" onClick={onCreateNamespaceOpen}>
          Create Default Closet Namespace
        </Button>
        <Button
          variant="outline"
          onClick={() => fetchStores()}
          isLoading={loading}
        >
          Refresh Stores
        </Button>
      </HStack>

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Divider />

      <Box>
        <Heading size="md" mb={4}>
          Available Metadata Stores ({stores.length})
        </Heading>
        <Alert status="warning" mb={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Performance Warning</Text>
            <Text fontSize="sm">
              This page uses DynamoDB Scan which is slow on large tables (30k+
              items). Click &ldquo;Load More&rdquo; to manually paginate through
              results. Backend optimization needed.
            </Text>
          </Box>
        </Alert>
        {loading && stores.length === 0 ? (
          <VStack spacing={2}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} height="40px" />
            ))}
          </VStack>
        ) : (
          <React.Fragment>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Namespace</Th>
                  <Th>Type</Th>
                  <Th>Description</Th>
                  <Th>Indexed Fields</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stores.map((store, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Tag colorScheme="gray" fontFamily="monospace">
                        {store.namespace}
                      </Tag>
                    </Td>
                    <Td>
                      <Badge colorScheme="purple">{store.type}</Badge>
                    </Td>
                    <Td>{store.description || '-'}</Td>
                    <Td>
                      {store.indexedFields && store.indexedFields.length > 0
                        ? store.indexedFields.map((field, i) => (
                            <Badge key={i} mr={1} colorScheme="blue">
                              {field.name} ({String(field.type)})
                            </Badge>
                          ))
                        : '-'}
                    </Td>
                    <Td>
                      <Badge colorScheme={store.exists ? 'green' : 'gray'}>
                        {store.exists ? 'Exists' : 'Not Created'}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {hasMore && (
              <Box mt={4} textAlign="center">
                <Button
                  onClick={() => {
                    fetchStores(nextCursor, pagesFetched);
                  }}
                  isLoading={loading}
                  colorScheme="blue"
                  variant="outline"
                  size="lg"
                >
                  Load More Stores (Scan Next Page)
                </Button>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Note: May need to scan multiple pages due to table size
                </Text>
              </Box>
            )}
          </React.Fragment>
        )}
      </Box>

      {/* Create Default Closet Namespace Modal */}
      <Modal isOpen={isCreateNamespaceOpen} onClose={onCreateNamespaceClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create tag_defaultCloset Namespace</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              This will create the{' '}
              <Tag colorScheme="gray" fontFamily="monospace">
                tag_defaultCloset
              </Tag>{' '}
              metadata namespace with the following indexed fields:
            </Text>
            <VStack align="stretch" spacing={2}>
              <Badge colorScheme="blue">orgId (STRING)</Badge>
              <Badge colorScheme="blue">appId (STRING)</Badge>
              <Badge colorScheme="blue">isDefault (BOOL)</Badge>
            </VStack>
            <Text fontSize="sm" color="gray.600" mt={4}>
              If the namespace already exists, this operation will report its
              current state.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateNamespaceClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateNamespace}>
              Create Namespace
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default MetadataStoreManager;
