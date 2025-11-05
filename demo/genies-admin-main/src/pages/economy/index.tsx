import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'src/general/components/Head';
import PageHeader from 'src/modules/PageHeader';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import forceAddHardCurrency from 'src/edge/shim/economy/forceAddHardCurrency';
import { Box, Button, Input, Flex, Text } from 'src/theme';
import { TransactionHistory } from 'src/modules/economy/transaction-history';

const Economy: NextPage = () => {
  const [userIdInputValue, setUserIdInputValue] = useState('');
  const [userResult, setUserResult] = useState('');
  const [walletType, setWalletType] = useState('buyer');

  const handleUserIdInputChange = (event) => {
    setUserIdInputValue(event.target.value);
  };

  const [hcInputValue, setHcInputValue] = useState(10);
  const handleHcInputChange = (event) => {
    let hcInt = parseInt(event.target.value);
    if (isNaN(hcInt)) {
      console.log(`Invalid input.`);
      setHcInputValue(event.target.value);
    } else {
      setHcInputValue(hcInt);
    }
  };

  const handleWalletTypeInputChange = (event) => {
    setWalletType(event.target.value);
  };

  const handleClick = async () => {
    const response = await forceAddHardCurrency(
      userIdInputValue,
      hcInputValue,
      walletType,
    );
    const date = Date.now();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
    setUserResult(`Your balance is now ${response?.balance} ${formattedDate}`);
  };

  let mainContentDiv = (
    <Box>
      <Flex w="full">
        <Input
          style={{ margin: '10px', padding: '2px', border: '1px solid black' }}
          type="text"
          value={userIdInputValue}
          onChange={handleUserIdInputChange}
          placeholder="User ID"
        />
      </Flex>
      <Flex>
        <Input
          style={{ margin: '10px', padding: '2px', border: '1px solid black' }}
          type="number"
          value={hcInputValue}
          onChange={handleHcInputChange}
          placeholder="amount of hc"
        />
      </Flex>
      <Flex>
        <Button
          title="ForceAddHardCurrency"
          onClick={handleClick}
          style={{ margin: '5px', padding: '10px' }}
        >
          ForceAddHardCurrency
        </Button>
        <Input
          style={{
            margin: '10px',
            padding: '2px',
            border: '1px solid black',
            width: '125px',
          }}
          type="text"
          value={walletType}
          onChange={handleWalletTypeInputChange}
          placeholder="Wallet Type"
        />
        <Text style={{ margin: '10px', padding: '2px' }}>{userResult}</Text>
      </Flex>
      <Flex>
        <TransactionHistory userId={userIdInputValue} />
      </Flex>
    </Box>
  );

  return (
    <React.Fragment>
      <Head subtitle="Economy" />
      <ContentLayoutWrapper
        pageHeader={<PageHeader title="Economy" />}
        mainContent={mainContentDiv}
      />
    </React.Fragment>
  );
};

export default Economy;
