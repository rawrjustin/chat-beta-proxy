import React, { useState } from 'react';
import {
  Button,
  Box,
  Flex,
  Input,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  Thead,
  Text,
} from '../../theme';
import getTransactionHistory from '../../edge/shim/economy/getTransactionHistory';
import { GetTransactionHistoryResponse } from '../../lib/swagger/admin';

export const TransactionHistory = ({ userId }: { userId: string }) => {
  const [transactionHistory, setTransactionHistory] =
    useState<GetTransactionHistoryResponse>(null);
  const [debugString, setDebugString] = useState<string>('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [store, setStore] = useState('');
  const handlePageInputChange = (event) => {
    const parsedValue = parseInt(event.target.value);
    if (!isNaN(parsedValue)) {
      setPage(parsedValue);
    } else {
      setPage(event.target.value);
    }
  };

  const handlePageSizeInputChange = (event) => {
    const parsedValue = parseInt(event.target.value);
    if (!isNaN(parsedValue)) {
      setPageSize(parsedValue);
    } else {
      setPageSize(event.target.value);
    }
  };

  const handleStoreInputChange = (event) => {
    setStore(event.target.value);
  };

  const handleClick = async () => {
    const response = await getTransactionHistory(userId, page, pageSize, store);
    let newDebugString = 'received no transactions';
    if (response?.transactions?.length > 0) {
      newDebugString = `received ${response.transactions.length} transactions.`;
    }
    setDebugString(newDebugString);
    setTransactionHistory(response);
  };

  const headers: string[] = [
    'id',
    'userId',
    'transactionType',
    'spentCurrencyType',
    'spentCurrencyAmount',
    'purchasedCurrencyType',
    'purchasedCurrencyAmount',
    'error',
    'store',
    'productId',
    'appSku',
    'status',
    'createdAt',
    'updatedAt',
  ];

  return (
    <Box w="full">
      <Flex flexDirection="row">
        <Button
          title="GetTransactionHistory"
          onClick={handleClick}
          style={{ margin: '5px', padding: '10px' }}
        >
          GetTransactionHistory
        </Button>
        <Input
          style={{
            margin: '10px',
            padding: '2px',
            border: '1px solid black',
            width: '10%',
          }}
          type="number"
          value={page}
          onChange={handlePageInputChange}
          placeholder="page"
        />
        <Input
          style={{
            margin: '10px',
            padding: '2px',
            border: '1px solid black',
            width: '10%',
          }}
          type="number"
          value={pageSize}
          onChange={handlePageSizeInputChange}
          placeholder="page_size"
        />
        <Input
          style={{
            margin: '10px',
            padding: '2px',
            border: '1px solid black',
            width: '10%',
          }}
          type="text"
          value={store}
          onChange={handleStoreInputChange}
          placeholder="store"
        />
      </Flex>
      <Table w="full">
        <Thead>
          <Tr>
            {headers.map((header) => (
              <Th key={header}>{header}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {transactionHistory?.transactions?.map((row, index) => (
            <Tr key={index}>
              {headers.map((header) => (
                <Td key={header}>{row[header]}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Text>{debugString}</Text>
    </Box>
  );
};
