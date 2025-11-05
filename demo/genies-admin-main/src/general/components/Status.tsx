import React, { Fragment } from 'react';
import { Text, Flex, Icon, Badge } from 'src/theme';
import {
  HiClock as Clock,
  HiCheckCircle as Check,
  HiPencil as Pencil,
} from 'react-icons/hi';
import { PlatformStatus } from 'src/edge/__generated/types/admin/globalTypes';

const statusInfo = {
  PUBLIC: { bg: 'green.200', icon: Check, text: 'Public' },
  ON_SALE: { bg: 'red.200', icon: Clock, text: 'On Sale' },
  DRAFT: { bg: 'purple.100', icon: Pencil, text: 'Draft' },
};

export const Status = ({ status }: { status: string }) => {
  // default status: PUBLIC
  if (!status) status = PlatformStatus.PUBLIC;

  const info = statusInfo[status];
  return (
    <Fragment>
      <Badge background={info.bg} borderRadius="3xl" px={3} py={1} zIndex={2}>
        <Flex align="center">
          <Icon mr="1" boxSize={5} color="black" as={info.icon} />
          <Text color="black" display="inline">
            {info.text}
          </Text>
        </Flex>
      </Badge>
    </Fragment>
  );
};
