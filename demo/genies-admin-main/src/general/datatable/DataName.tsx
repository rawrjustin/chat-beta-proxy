import React from 'react';
import { Flex, Icon } from 'src/theme';
import { HiOutlineFolderOpen as FolderOpen } from 'react-icons/hi';
import Link from 'next/link';

export const DataName = ({
  name,
  isSelected,
  url,
}: {
  name: string;
  isSelected: boolean;
  url: string;
}) => {
  return (
    <Flex align="center">
      <Icon boxSize={6} mr={3} as={FolderOpen} />
      <Flex display="inline" color={isSelected ? 'users.purple' : 'white'}>
        <Link href={url}>{name}</Link>
      </Flex>
    </Flex>
  );
};
