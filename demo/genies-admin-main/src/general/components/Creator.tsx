import React from 'react';
import { Text, Flex, Box, Avatar } from 'src/theme';

export const Creator = ({
  creator,
  isSelected = false,
}: {
  creator: string;
  isSelected?: boolean;
}) => {
  return (
    <Flex align="center">
      <Box w={8} h={8} mr={3}>
        <Avatar size="full" src="/static/images/avatar.svg" />
      </Box>
      <Text
        display="inline"
        color={isSelected ? 'users.purple' : 'white'}
        maxW="20ch"
        noOfLines={1}
      >
        {creator}
      </Text>
    </Flex>
  );
};
