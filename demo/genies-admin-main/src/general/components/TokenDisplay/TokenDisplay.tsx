import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  VStack,
  Text,
  useToast,
  HStack,
} from 'src/theme';
import { getTokens, getUserFromAccessToken } from 'src/lib/auth';
import { getClientHash } from 'src/general/utils/getClientHash';
import { useRefreshAccessToken } from 'src/lib/auth/useRefreshAccessToken';

export const TokenDisplay = () => {
  const toast = useToast();
  const [hasCopied, setHasCopied] = useState(false);
  const [clientHash, setClientHash] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refreshAccessToken } = useRefreshAccessToken();

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  useEffect(() => {
    // Load client hash and userId on mount
    getClientHash().then((hash) => {
      if (hash) {
        setClientHash(hash);
      }
    });

    const tokens = getTokens();
    if (tokens.accessToken) {
      const user = getUserFromAccessToken(tokens.accessToken);
      if (user?.userId) {
        setUserId(user.userId);
      }
    }
  }, []);

  const handleCopyToken = () => {
    const tokens = getTokens();
    const accessToken = tokens.accessToken || '';

    if (!accessToken) {
      toast({
        title: 'No token available',
        description: 'Please log in to get an access token',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(accessToken);
    setHasCopied(true);

    toast({
      title: 'Token copied!',
      description: 'Access token copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top',
    });
  };

  const handleCopyHash = () => {
    if (!clientHash) {
      toast({
        title: 'No hash available',
        description: 'Client hash not loaded',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    navigator.clipboard.writeText(clientHash);
    toast({
      title: 'Hash copied!',
      description: 'Client hash copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top',
    });
  };

  const handleCopyUserId = () => {
    if (!userId) {
      toast({
        title: 'No user ID available',
        description: 'User ID not found',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    navigator.clipboard.writeText(userId);
    toast({
      title: 'User ID copied!',
      description: 'User ID copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top',
    });
  };

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      await refreshAccessToken();

      // Update userId after refresh
      const tokens = getTokens();
      if (tokens.accessToken) {
        const user = getUserFromAccessToken(tokens.accessToken);
        if (user?.userId) {
          setUserId(user.userId);
        }
      }

      toast({
        title: 'Token refreshed!',
        description: 'Access token has been refreshed successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: 'Failed to refresh access token',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Box mr={4}>
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Button
            size="sm"
            colorScheme="whiteAlpha"
            variant="outline"
            color="white"
            borderColor="whiteAlpha.400"
            _hover={{
              bg: 'whiteAlpha.200',
              borderColor: 'whiteAlpha.600',
            }}
            data-testid="token-display-button"
          >
            {hasCopied ? '✓' : '🔑'}
          </Button>
        </PopoverTrigger>
        <PopoverContent bg="gray.800" borderColor="gray.600" width="400px">
          <PopoverArrow bg="gray.800" />
          <PopoverCloseButton color="white" />
          <PopoverHeader
            fontWeight="bold"
            borderBottomWidth="1px"
            borderColor="gray.600"
            color="white"
          >
            API Credentials
          </PopoverHeader>
          <PopoverBody>
            <VStack align="stretch" spacing={3} py={2}>
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={1} color="white">
                  User ID
                </Text>
                <Text
                  fontSize="xs"
                  color="gray.300"
                  mb={2}
                  bg="gray.700"
                  px={2}
                  py={2}
                  borderRadius="md"
                  fontFamily="monospace"
                  wordBreak="break-all"
                >
                  {userId || 'Not available'}
                </Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleCopyUserId}
                  width="full"
                  isDisabled={!userId}
                >
                  Copy User ID
                </Button>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={1} color="white">
                  Bearer Token
                </Text>
                <Text fontSize="xs" color="gray.300" mb={2}>
                  Header:{' '}
                  <Text
                    as="span"
                    fontSize="xs"
                    bg="gray.700"
                    color="blue.300"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontFamily="monospace"
                  >
                    Authorization: Bearer [token]
                  </Text>
                </Text>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={handleCopyToken}
                    flex={1}
                  >
                    Copy Access Token
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={handleRefreshToken}
                    isLoading={isRefreshing}
                    flex={1}
                  >
                    Refresh Token
                  </Button>
                </HStack>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={1} color="white">
                  Client Hash
                </Text>
                <Text fontSize="xs" color="gray.300" mb={2}>
                  Header:{' '}
                  <Text
                    as="span"
                    fontSize="xs"
                    bg="gray.700"
                    color="blue.300"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontFamily="monospace"
                  >
                    x-client-hash: [hash]
                  </Text>
                  <br />
                  <Text as="span" fontSize="xs" color="orange.300">
                    (Required for consumer API endpoints)
                  </Text>
                </Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleCopyHash}
                  width="full"
                  isDisabled={!clientHash}
                >
                  Copy Client Hash
                </Button>
              </Box>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};
