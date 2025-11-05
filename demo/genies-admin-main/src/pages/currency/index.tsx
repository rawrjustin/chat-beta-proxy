import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'src/general/components/Head';
import PageHeader from 'src/modules/PageHeader';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import getHardCurrencyProducts from 'src/edge/shim/economy/getHardCurrencyProducts';
import { Box, Flex, Button, Text, Heading, Divider } from 'src/theme';
import { HardCurrencyProductTable } from 'src/modules/currency/HardCurrencyProductTable';
import { SoftCurrencyProductTable } from 'src/modules/currency/SoftCurrencyProductTable';
import {
  HardCurrencyProductMetadata,
  HardCurrencyProductWithMappings,
  SoftCurrencyProductWithMetadata,
  Currency,
} from '../../lib/swagger/admin';
import { HardCurrencyProductView } from '../../modules/currency/HardCurrencyProductView';
import {
  CurrencyEnvironment,
  CurrencyEnvironmentMap,
  QaEnv,
  InternalEnv,
  ProdEnv,
  ReleaseQaEnv,
} from '../../modules/currency/CurrencyEnvironment';
import getAllHCProductMetadata from '../../edge/shim/economy/getAllHCProductMetadata';
import getAllSoftCurrencyProducts from '../../edge/shim/economy/getAllSoftCurrencyProducts';
import { SoftCurrencyProductView } from '../../modules/currency/SoftCurrencyProductView';
import getAllCurrenciesForOwner from '../../edge/shim/economy/getAllCurrencies';

interface CurrencyWithProducts {
  currency: Currency;
  products: SoftCurrencyProductView[];
}

const CurrencyProducts: NextPage = () => {
  // Set environment
  let initialEnvironment: CurrencyEnvironment =
    CurrencyEnvironmentMap[process.env.NEXT_PUBLIC_CURRENCY_ENVIRONMENT];
  let isProduction = initialEnvironment.name === ProdEnv.name;
  const [environment, setEnvironment] =
    useState<CurrencyEnvironment>(initialEnvironment);
  const [hardCurrencyProducts, setHardCurrencyProducts] = useState<
    HardCurrencyProductView[]
  >([]);
  const [softCurrencies, setSoftCurrencies] = useState<CurrencyWithProducts[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        // 1. Fetch all currencies for the current environment party ID
        const currenciesResponse = await getAllCurrenciesForOwner(
          environment.partyId,
        );

        if (!currenciesResponse?.currencies?.length) {
          setErrorMessage(
            `No currencies found for party ${environment.partyId}`,
          );
          setSoftCurrencies([]);
          setHardCurrencyProducts([]);
          setIsLoading(false);
          return;
        }

        // Filter to just get soft currencies
        const softCurrenciesList = currenciesResponse.currencies.filter(
          (c) => c.currencyType === 'SOFT',
        );

        if (!softCurrenciesList.length) {
          // Try case-insensitive matching as a fallback
          const softCurrenciesCaseInsensitive =
            currenciesResponse.currencies.filter(
              (c) => c.currencyType && c.currencyType.toUpperCase() === 'SOFT',
            );

          if (softCurrenciesCaseInsensitive.length > 0) {
            // Use these instead
            softCurrenciesList.push(...softCurrenciesCaseInsensitive);
          } else {
            // Detailed error message with available currency types
            const availableCurrencyTypes = Array.from(
              new Set(currenciesResponse.currencies.map((c) => c.currencyType)),
            );
            setErrorMessage(
              `No SOFT currencies found. Available currency types: ${availableCurrencyTypes.join(
                ', ',
              )}. 
              You might need to create a soft currency first or check for case sensitivity issues.`,
            );
            // Don't proceed with loading other data if we have no currencies
            setIsLoading(false);
            return;
          }
        }

        // 2. Fetch hard currency products
        const hardProductsResponse = await getHardCurrencyProducts(
          environment.partyId,
        );
        let hardProducts: HardCurrencyProductWithMappings[] =
          hardProductsResponse?.productsWithMappings || [];

        // 3. Fetch hard currency metadata
        const metadataResponse = await getAllHCProductMetadata();
        let hardMetadata: HardCurrencyProductMetadata[] =
          metadataResponse?.metadataList || [];

        // 4. Process hard currency products
        const hardProductViews = convertHCProductModelsToViews(
          hardProducts,
          hardMetadata,
        );
        setHardCurrencyProducts(hardProductViews);

        // 5. Fetch and process each soft currency's products
        const softCurrenciesWithProducts: CurrencyWithProducts[] = [];

        for (const currency of softCurrenciesList) {
          // Fetch products for this currency
          const productsResponse = await getAllSoftCurrencyProducts(
            currency.currencyId,
            true,
            true,
          );

          // Convert to view models
          const products = productsResponse?.products || [];
          const productViews = convertSCProductModelsToViews(products);

          // Add to our list
          softCurrenciesWithProducts.push({
            currency,
            products: productViews,
          });
        }

        setSoftCurrencies(softCurrenciesWithProducts);
      } catch (e) {
        console.error('Error fetching data:', e);
        setErrorMessage(`Failed to fetch data: ${e.message}`);
        setHardCurrencyProducts([]);
        setSoftCurrencies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [environment]);

  const convertSCProductModelsToViews = (
    productList: SoftCurrencyProductWithMetadata[],
  ): SoftCurrencyProductView[] => {
    let viewList: SoftCurrencyProductView[] = [];
    for (let i = 0; i < productList.length; i++) {
      let product = productList[i];
      let productView = new SoftCurrencyProductView(i);
      productView.currencyId = product.currencyId;
      productView.productSku = product.productSku;
      productView.amount = product.amount;
      productView.isActive = product.isActive as boolean;
      productView.hcCost = product.hcCost;
      productView.title = product?.metadata?.title || '';
      productView.description = product?.metadata?.description || '';
      productView.iconUrl = product?.metadata?.iconUrl || '';
      viewList.push(productView);
    }
    return viewList;
  };

  const convertHCProductModelsToViews = (
    productList: HardCurrencyProductWithMappings[],
    metadataList: HardCurrencyProductMetadata[],
  ): HardCurrencyProductView[] => {
    let viewList: HardCurrencyProductView[] = [];
    for (let i = 0; i < productList.length; i++) {
      let product = productList[i];
      let productView = new HardCurrencyProductView(i);
      productView.productSku = product.product.productSku;
      productView.amount = product.product.amount;
      productView.isActive = product.product.isActive as boolean;

      // search through mappings for productIds
      for (let j = 0; j < product.mappings.length; j++) {
        let mapping = product.mappings[j];
        const AppleStoreId = 1;
        if (mapping.storeId === AppleStoreId) {
          productView.appleProductId = mapping.productId;
        } else {
          productView.googleProductId = mapping.productId;
        }
      }

      // search through the metadata
      for (let i = 0; i < metadataList.length; i++) {
        let metadata = metadataList[i];
        if (metadata.productSku === productView.productSku) {
          productView.title = metadata.title;
          productView.description = metadata.description;
          productView.iconUrl = metadata.iconUrl;
          break;
        }
      }

      viewList.push(productView);
    }
    return viewList;
  };

  const handleToggleEnvironment = () => {
    let nextEnv: CurrencyEnvironment = null;
    if (isProduction) {
      if (environment.name === ReleaseQaEnv.name) {
        nextEnv = ProdEnv;
      } else {
        nextEnv = ReleaseQaEnv;
      }
    } else {
      if (environment.name === InternalEnv.name) {
        nextEnv = QaEnv;
      } else {
        nextEnv = InternalEnv;
      }
    }
    setEnvironment(nextEnv);
  };

  let mainContentDiv = (
    <Box>
      <Flex flexDirection="column">
        {isLoading ? (
          <Text>Loading currency data...</Text>
        ) : errorMessage ? (
          <Text color="red.500">{errorMessage}</Text>
        ) : (
          <React.Fragment>
            <HardCurrencyProductTable
              environment={environment}
              products={hardCurrencyProducts}
            />

            <Divider my={6} />

            {softCurrencies.length > 0 ? (
              softCurrencies.map((currencyWithProducts, index) => (
                <Box
                  key={currencyWithProducts.currency.currencyId}
                  mt={index > 0 ? 8 : 0}
                  mb={6}
                >
                  <Heading size="md" mb={3}>
                    {currencyWithProducts.currency.currencyName} (
                    {currencyWithProducts.currency.currencyId})
                  </Heading>
                  <SoftCurrencyProductTable
                    environment={environment}
                    products={currencyWithProducts.products}
                    currencyId={currencyWithProducts.currency.currencyId}
                    showTitle={false}
                  />
                  {index < softCurrencies.length - 1 && <Divider my={6} />}
                </Box>
              ))
            ) : (
              <Text>No soft currencies found for this environment.</Text>
            )}
          </React.Fragment>
        )}
        <Button
          onClick={handleToggleEnvironment}
          width="150px"
          marginLeft="10px"
          marginRight="10px"
          marginTop="20px"
        >
          app: {environment.name}
        </Button>
      </Flex>
    </Box>
  );

  return (
    <React.Fragment>
      <Head subtitle="Currency Products" />
      <ContentLayoutWrapper
        pageHeader={<PageHeader title="Currency Products" />}
        mainContent={mainContentDiv}
      />
    </React.Fragment>
  );
};

export default CurrencyProducts;
