import React, { Fragment } from 'react';
import { Text, Flex, Icon, Badge } from 'src/theme';
import { HiCheckCircle as Check, HiPencil as Pencil } from 'react-icons/hi';

const statusInfo = {
  published: { bg: 'green.200', icon: Check, text: 'Published' },
  draft: { bg: 'purple.100', icon: Pencil, text: 'Draft' },
};

export const LookStatus = ({ status }: { status: string }) => {
  if (!status) status = 'draft';

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
