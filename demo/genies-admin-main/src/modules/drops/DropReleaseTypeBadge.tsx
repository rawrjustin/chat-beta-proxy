import React, { Fragment } from 'react';
import { Text, Flex, Icon, Badge } from 'src/theme';
import {
  HiOutlineFolderOpen as FolderOpen,
  HiDownload as Download,
} from 'react-icons/hi';
import { DropReleaseType } from './DropTypes';

const CollectionBadge = () => (
  <Fragment>
    <Badge background="purple.300" borderRadius="3xl" px={3} py={1} zIndex={2}>
      <Flex align="center">
        <Icon mr="1" boxSize={5} color="black" as={FolderOpen} />
        <Text color="black" display="inline">
          Collection
        </Text>
      </Flex>
    </Badge>
  </Fragment>
);

const AirdropBadge = () => (
  <Fragment>
    <Badge background="gray.600" borderRadius="3xl" px={3} py={1} zIndex={2}>
      <Flex align="center">
        <Text color="white" display="inline">
          AirDrop
        </Text>
        <Icon ml="1" boxSize={5} color="white" as={Download} />
      </Flex>
    </Badge>
  </Fragment>
);
export const DropReleaseTypeBadge = ({
  type,
}: {
  type: 'Airdrop' | 'Collection';
}) => {
  if (type === DropReleaseType.Collection) return <CollectionBadge />;
  else return <AirdropBadge />;
};
