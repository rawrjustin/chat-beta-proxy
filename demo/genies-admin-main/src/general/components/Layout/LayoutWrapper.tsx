import { FC, ReactElement } from 'react';
import { Flex } from 'src/theme';
import { Header } from './Header';
import { SidebarContent } from './Siderbar';
import { useAuth } from 'src/lib/auth';

type Props = {
  children: ReactElement;
};

export const LayoutWrapper: FC<Props> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return (
    <Flex height="100%" flexDirection="column">
      <Flex>
        <Header />
      </Flex>
      <Flex h="100%" minH="95vh">
        <Flex>{isAuthenticated && <SidebarContent />}</Flex>
        {children}
      </Flex>
    </Flex>
  );
};

interface ContentLayoutProps {
  pageHeader: React.ReactNode;
  mainContent?: React.ReactNode;
  actionsContainer?: React.ReactNode;
}

export const ContentLayoutWrapper: FC<ContentLayoutProps> = ({
  pageHeader,
  mainContent,
  actionsContainer,
}) => {
  return (
    <Flex flex={1} flexDirection="column">
      <Flex w="full" mb={6}>
        {pageHeader}
      </Flex>
      <Flex w="full">
        {mainContent && (
          <Flex w="full" justify="start" flexDirection="column">
            {mainContent}
          </Flex>
        )}
        {actionsContainer && (
          <Flex w="2xs" ml={25} mr={25} align="flex-start">
            {actionsContainer}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default LayoutWrapper;
