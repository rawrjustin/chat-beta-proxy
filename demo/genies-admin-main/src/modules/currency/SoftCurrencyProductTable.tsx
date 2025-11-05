import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Flex,
  Input,
  Table,
  Tbody,
  Tr,
  Th,
  Thead,
  Text,
} from '../../theme';
import { SoftCurrencyProductRow } from './SoftCurrencyProductRow';
import addSoftCurrencyProduct from '../../edge/shim/economy/addSoftCurrencyProduct';
import { CurrencyEnvironment } from './CurrencyEnvironment';
import { SoftCurrencyProductView } from './SoftCurrencyProductView';
import updateSoftCurrencyProduct from '../../edge/shim/economy/updateSoftCurrencyProduct';
import uploadCurrencyImage from '../../edge/shim/economy/uploadCurrencyImage';

export const SoftCurrencyProductTable = ({
  environment,
  products,
  currencyId,
  showTitle = true,
}: {
  environment: CurrencyEnvironment;
  products: SoftCurrencyProductView[];
  currencyId?: string; // Make it optional for backward compatibility
  showTitle?: boolean; // Whether to show the "Soft" title (default: true)
}) => {
  const [tableData, setTableData] = useState<SoftCurrencyProductView[]>([]);
  useEffect(() => {
    setTableData(products);
  }, [products]);

  const [createProductSku, setCreateProductSku] = useState('');
  const [createProductAmount, setCreateProductAmount] = useState<number>(null);

  // Get the currency ID to use - prefer the dynamic one, fall back to the environment one if it exists
  const activeCurrencyId = currencyId || environment.softCurrencyId || '';

  // If we don't have a currency ID, we can't operate
  const hasCurrencyId = Boolean(activeCurrencyId);

  const headers: string[] = [
    'icon',
    'productSku',
    'amount',
    'isActive',
    'hcCost',
    'title',
    'description',
  ];

  const handleSave = async (updatedProduct: SoftCurrencyProductView) => {
    const updatedTableData = tableData.map((product) =>
      product.rowId === updatedProduct.rowId ? updatedProduct : product,
    );
    const updateResponse = await updateSoftCurrencyProduct(
      updatedProduct.currencyId,
      updatedProduct.productSku,
      updatedProduct.amount,
      updatedProduct.hcCost,
      updatedProduct.isActive,
      updatedProduct.title,
      updatedProduct.description,
      updatedProduct.iconUrl,
    );
    // upload icon file
    if (updatedProduct.iconFile) {
      let uploadResult = await uploadCurrencyImage(
        updatedProduct.iconFile,
        'product',
      );
      if (uploadResult) {
        console.log('upload icon success!');
      }
    }
    if (updateResponse) {
      setTableData(updatedTableData);
      console.log('Saved:', updatedProduct);
    }
  };

  const handleCancel = () => {
    console.log('Edit cancelled');
  };

  const handleDelete = (rowId: number) => {
    const updatedData = tableData.filter((item) => item.rowId !== rowId);
    setTableData(updatedData);
  };

  const handleCreate = async () => {
    // create initial product, starting out as inactive
    try {
      let hcCost = 10;
      let isActive = false;
      let title = '';
      let description = '';
      let iconUrl = '';

      // Use the dynamic currency ID
      const response = await addSoftCurrencyProduct(
        activeCurrencyId,
        createProductSku,
        createProductAmount,
        hcCost,
        isActive,
        title,
        description,
        iconUrl,
      );

      // add this new product, if it is valid
      if (response && response.productSku?.length > 0) {
        let index = tableData.length + 1;
        let newProduct = new SoftCurrencyProductView(index);
        newProduct.currencyId = activeCurrencyId;
        newProduct.productSku = createProductSku;
        newProduct.amount = createProductAmount;
        newProduct.hcCost = hcCost;
        newProduct.isActive = false;
        newProduct.title = title;
        newProduct.description = description;
        newProduct.iconUrl = iconUrl;
        setTableData([...tableData, newProduct]);
      } else {
        console.log('failed to create product, product response is invalid ');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputAmountChange = (e) => {
    const value = e.target.value;
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue)) {
      setCreateProductAmount(parsedValue);
    } else {
      setCreateProductAmount(value);
    }
  };

  const handleInputProductSkuChange = (e) => {
    let value = e.target.value;
    setCreateProductSku(value);
  };

  let productsJsx = (
    <div>
      {showTitle && (
        <Text
          align="center"
          fontWeight="semibold"
          fontSize="24px"
          color="#F5D76E"
        >
          Soft
        </Text>
      )}
      <Box mb={2}>
        {!hasCurrencyId && (
          <Text fontSize="sm" color="red.500" mt={1}>
            No currency ID available. Please create a currency first.
          </Text>
        )}
      </Box>
      <Table w="full">
        <Thead>
          <Tr>
            {headers.map((header) => (
              <Th key={header}>{header}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {tableData.map((row, index) => (
            <SoftCurrencyProductRow
              key={row.rowId}
              rowData={row}
              onSave={handleSave}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
          ))}
        </Tbody>
      </Table>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        minWidth="400px"
        maxWidth="800px"
        padding="10px"
      >
        <Button
          onClick={handleCreate}
          minWidth="100px"
          marginRight="10px"
          isDisabled={!hasCurrencyId}
        >
          Create
        </Button>
        <Input
          type="text"
          name="createProductSku"
          placeholder="product sku"
          value={createProductSku}
          onChange={handleInputProductSkuChange}
          marginRight="10px"
        />
        <Input
          type="number"
          name="amount"
          placeholder="sc reward amount"
          value={createProductAmount}
          onChange={handleInputAmountChange}
        />
      </Flex>
    </div>
  );
  return <Box>{productsJsx}</Box>;
};
