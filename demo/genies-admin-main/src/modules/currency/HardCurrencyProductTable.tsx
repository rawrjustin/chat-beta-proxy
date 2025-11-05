import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Flex,
  Input,
  Table,
  Text,
  Tbody,
  Tr,
  Th,
  Thead,
} from '../../theme';
import { HardCurrencyProductView } from './HardCurrencyProductView';
import { HardCurrencyProductRow } from './HardCurrencyProductRow';
import updateHardCurrencyProduct from '../../edge/shim/economy/updateHardCurrencyProduct';
import addHardCurrencyProduct from '../../edge/shim/economy/addHardCurrencyProduct';
import { CurrencyEnvironment } from './CurrencyEnvironment';
import upsertHCProductSkuMapping from '../../edge/shim/economy/upsertHCProductSkuMapping';
import { StoreType } from './StoreType';
import upsertHCProductMetadata from '../../edge/shim/economy/upsertHCProductMetadata';
import uploadCurrencyImage from '../../edge/shim/economy/uploadCurrencyImage';

export const HardCurrencyProductTable = ({
  environment,
  products,
}: {
  environment: CurrencyEnvironment;
  products: HardCurrencyProductView[];
}) => {
  const [tableData, setTableData] = useState<HardCurrencyProductView[]>([]);
  useEffect(() => {
    setTableData(products);
  }, [products]);

  const [createProductSku, setCreateProductSku] = useState('');
  const [createProductAmount, setCreateProductAmount] = useState<number>(null);

  const headers: string[] = [
    'icon',
    'productSku',
    'amount',
    'isActive',
    'appleProductId',
    'googleProductId',
    'title',
    'description',
  ];

  const handleSave = async (updatedProduct: HardCurrencyProductView) => {
    const updatedTableData = tableData.map((product) =>
      product.rowId === updatedProduct.rowId ? updatedProduct : product,
    );
    const updateResponse = await updateHardCurrencyProduct(
      updatedProduct.productSku,
      updatedProduct.amount,
      updatedProduct.isActive,
    );
    if (updateResponse) {
      // now, update product sku mapping
      await upsertHCProductSkuMapping(
        environment.partyId,
        StoreType.Apple,
        updatedProduct.appleProductId,
        updatedProduct.productSku,
      );
      await upsertHCProductSkuMapping(
        environment.partyId,
        StoreType.Google,
        updatedProduct.googleProductId,
        updatedProduct.productSku,
      );
      await upsertHCProductMetadata(
        updatedProduct.productSku,
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
      setTableData(updatedTableData);
      console.log('Saved:', updatedProduct);
    }
  };

  const handleCancel = () => {
    console.log('Edit cancelled');
  };

  const handleCreate = async () => {
    // create initial product, starting out as inactive
    try {
      const response = await addHardCurrencyProduct(
        createProductSku,
        createProductAmount,
        false,
      );

      // add this new product, if it is valid
      if (response && response.productSku?.length > 0) {
        let index = tableData.length + 1;
        let newProduct = new HardCurrencyProductView(index);
        newProduct.productSku = createProductSku;
        newProduct.amount = createProductAmount;
        newProduct.isActive = false;
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
      <Text
        align="center"
        fontWeight="semibold"
        fontSize="24px"
        color="#17B169"
      >
        Hard
      </Text>
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
            <HardCurrencyProductRow
              key={row.rowId}
              rowData={row}
              onSave={handleSave}
              onCancel={handleCancel}
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
        <Button onClick={handleCreate} minWidth="100px" marginRight="10px">
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
          placeholder="hc reward amount"
          value={createProductAmount}
          onChange={handleInputAmountChange}
        />
      </Flex>
    </div>
  );
  return <Box>{productsJsx}</Box>;
};
