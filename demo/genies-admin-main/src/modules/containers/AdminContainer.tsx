import React, { ReactNode } from 'react';
import { Flex } from 'src/theme';

interface Props {
  children?: ReactNode;
}

export function AdminContainer({ children }: Props) {
  return (
    <Flex minW={0} p={0}>
      {children}
    </Flex>
  );
}
