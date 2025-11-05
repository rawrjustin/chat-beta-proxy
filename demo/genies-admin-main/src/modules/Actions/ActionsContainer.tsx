import React, { ReactElement } from 'react';
import { Flex, Text, Divider } from 'src/theme';

interface Props {
  children?: ReactElement[] | ReactElement;
}

export const ActionsContainer: React.FC<Props> = ({ children }) => {
  if (!Array.isArray(children)) {
    children = [children];
  }
  children = children.filter((child) => child);
  if (children.length === 0) return null;
  return (
    <Flex flexDir="column" align="flex-start">
      <Text textStyle="actionsFont" mb={5}>
        Actions
      </Text>
      {children.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          <Divider mt={2} mb={2} />
        </React.Fragment>
      ))}
    </Flex>
  );
};
