import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'src/general/components/Head';
import PageHeader from 'src/modules/PageHeader';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  useDisclosure,
  Icon,
  Image,
} from 'src/theme';
import { HiPlusCircle as AddIcon, HiPencil as EditIcon } from 'react-icons/hi';
import getAllCurrenciesForOwner from 'src/edge/shim/economy/getAllCurrencies';
import CurrencyForm from 'src/modules/currency/CurrencyForm';
import { Currency } from 'src/lib/swagger/admin';
import {
  InternalEnv,
  QaEnv,
  ProdEnv,
  ReleaseQaEnv,
} from 'src/modules/currency/CurrencyEnvironment';

// Image component with fallback
const CurrencyImage = ({ iconUrl, currencyName, currencyId }) => {
  const [imageError, setImageError] = useState(false);

  if (!iconUrl || imageError) {
    // Show default icon based on currency name (if it contains "HARD" or "SOFT")
    const isHardCurrency = currencyName?.toUpperCase().includes('HARD');
    return (
      <Box
        w="40px"
        h="40px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.100"
        borderRadius="md"
      >
        {isHardCurrency ? (
          <Text fontSize="xl">💎</Text>
        ) : (
          <Text fontSize="xl">🪙</Text>
        )}
      </Box>
    );
  }

  // Construct the full URL - iconUrl should already be a relative path
  const cacheBuster = new Date().getTime(); // Add timestamp to prevent caching
  const fullImageUrl = `${process.env.NEXT_PUBLIC_CURRENCY_URL_PREFIX}/${iconUrl}?v=${cacheBuster}`;

  return (
    <Box w="40px" h="40px" overflow="hidden" borderRadius="md">
      <Image
        src={fullImageUrl}
        alt={`${currencyName} icon`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onError={(e) => {
          console.error(
            `Image load error for currency ${currencyId} (${currencyName}):`,
            {
              path: iconUrl,
              fullUrl: fullImageUrl,
              element: e.currentTarget,
            },
          );
          setImageError(true);
        }}
      />
    </Box>
  );
};

const Currencies: NextPage = () => {
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

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState(PARTY_IDS[0].value);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null,
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchCurrencies = async (owner: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllCurrenciesForOwner(owner);
      if (response && response.currencies) {
        setCurrencies(response.currencies);
      } else {
        setCurrencies([]);
        setError('No currencies found or API returned an empty response');
      }
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      setError(`Error: ${error.message || 'Unknown error occurred'}`);
      setCurrencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies(ownerId);
  }, [ownerId]);

  const handleOwnerIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOwnerId(e.target.value);
  };

  const handleSearch = () => {
    fetchCurrencies(ownerId);
  };

  const handleAddNewCurrency = () => {
    setSelectedCurrency(null);
    onOpen();
  };

  const handleEditCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    onOpen();
  };

  const handleFormSuccess = (deletedCurrencyId?: string) => {
    if (deletedCurrencyId) {
      // If a currency was deleted, immediately update the UI
      setCurrencies(
        currencies.filter((c) => c.currencyId !== deletedCurrencyId),
      );
    }
    // Refresh the currencies list from the server
    fetchCurrencies(ownerId);
  };

  const renderCurrencyList = () => {
    if (loading) {
      return <Text fontSize="lg">Loading currencies...</Text>;
    }

    if (error) {
      return (
        <Box p={4} bg="red.50" color="red.600" borderRadius="md">
          <Text fontWeight="bold">Error loading currencies</Text>
          <Text>{error}</Text>
        </Box>
      );
    }

    if (currencies.length === 0) {
      return (
        <Box p={4} bg="gray.50" borderRadius="md">
          <Text fontSize="lg" mb={3}>
            No currencies found for this owner ID.
          </Text>
          <Box mb={2}>
            <Text fontWeight="bold" mb={1}>
              Selected Owner ID:
            </Text>
            <Box p={2} bg="gray.100" borderRadius="md" fontFamily="monospace">
              {ownerId}
            </Box>
          </Box>
          <Text fontSize="sm" color="gray.600">
            Try selecting a different owner ID from the dropdown above.
          </Text>
        </Box>
      );
    }

    return (
      <Box>
        <Table w="full">
          <Thead>
            <Tr>
              <Th>Icon</Th>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Currency ID</Th>
              <Th>Owner Type</Th>
              <Th>Owner ID</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currencies.map((currency) => (
              <Tr key={currency.currencyId}>
                <Td>
                  <CurrencyImage
                    iconUrl={currency.currencyIconUrl}
                    currencyName={currency.currencyName}
                    currencyId={currency.currencyId}
                  />
                </Td>
                <Td fontWeight="medium">{currency.currencyName}</Td>
                <Td>
                  <Text align="center" fontWeight="semibold">
                    {currency.currencyType}
                  </Text>
                </Td>
                <Td>
                  <Box
                    as="span"
                    p={1}
                    borderRadius="sm"
                    fontFamily="monospace"
                    fontSize="sm"
                  >
                    {currency.currencyId}
                  </Box>
                </Td>
                <Td>{currency.ownerType}</Td>
                <Td>
                  <Box
                    as="span"
                    p={1}
                    borderRadius="sm"
                    fontFamily="monospace"
                    fontSize="xs"
                  >
                    {currency.ownerId}
                  </Box>
                </Td>
                <Td>
                  {currency.createdAt
                    ? new Date(currency.createdAt).toLocaleString()
                    : 'N/A'}
                </Td>
                <Td>
                  <Tooltip label="Edit currency">
                    <Button
                      aria-label="Edit currency"
                      leftIcon={<Icon as={EditIcon} />}
                      size="sm"
                      onClick={() => handleEditCurrency(currency)}
                      colorScheme="blue"
                      variant="ghost"
                    />
                  </Tooltip>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  // Main content div structure similar to Currency page
  const mainContentDiv = (
    <Box>
      <Flex flexDirection="column">
        <Box mb={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            mb={4}
            p={2}
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <Heading size="md">Currency Search</Heading>
            <Button
              leftIcon={<Icon as={AddIcon} />}
              colorScheme="green"
              size="sm"
              onClick={handleAddNewCurrency}
            >
              Add New Currency
            </Button>
          </Flex>
          <Flex alignItems="center" mb={4} p={2}>
            <Text minWidth="100px">Owner ID:</Text>
            <Select
              value={ownerId}
              onChange={handleOwnerIdChange}
              mr={4}
              width="400px"
              data-testid="owner-id-select"
            >
              {PARTY_IDS.map((party) => (
                <option key={party.value} value={party.value}>
                  {party.label}
                </option>
              ))}
            </Select>
            <Button onClick={handleSearch} colorScheme="blue">
              Search
            </Button>
          </Flex>
        </Box>

        <Box>{renderCurrencyList()}</Box>
      </Flex>

      {/* Currency Form Modal */}
      <CurrencyForm
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleFormSuccess}
        editCurrency={selectedCurrency}
      />
    </Box>
  );

  return (
    <React.Fragment>
      <Head subtitle="Currencies" />
      <ContentLayoutWrapper
        pageHeader={<PageHeader title="Currencies" />}
        mainContent={mainContentDiv}
      />
    </React.Fragment>
  );
};

export default Currencies;
