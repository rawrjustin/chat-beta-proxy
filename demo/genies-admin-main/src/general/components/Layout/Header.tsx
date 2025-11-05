import {
  Flex,
  Box,
  Text,
  InputGroup,
  InputLeftElement,
  Input,
  SearchIcon,
  Image,
} from 'src/theme';
import { useGetFeatureFlags, AdminFeatureFlags } from 'src/lib/statsig';
import { useAuth } from 'src/lib/auth';
import { TokenDisplay } from 'src/general/components/TokenDisplay';
import { UserMenu } from 'src/general/components/UserMenu';

export const Header = () => {
  const { isAuthenticated } = useAuth();
  const enableSearchBar = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_SEARCH_BAR,
  );
  return (
    <Flex
      align="center"
      justify="space-between"
      wrap="wrap"
      w="full"
      h={20}
      minW="container.sm"
      bgGradient="linear(to-r, header.gradientStart, header.gradientEnd)"
    >
      <Flex h="full">
        <Box w={16} h={12} ml={6}>
          <Image boxSize="full" alt="Logo" src="/static/images/logo.svg" />
        </Box>
        <Box py={8}>
          <Text fontWeight="bold" fontSize="xs" color="white">
            ADMIN V 0.1
          </Text>
        </Box>
      </Flex>
      {isAuthenticated && (
        <Flex align="center">
          {enableSearchBar && (
            <Box mr={6}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="white" />
                </InputLeftElement>
                <Input
                  type="text"
                  placeholder="Search Anything"
                  borderRadius="3xl"
                  borderColor="searchBar.border"
                  bg="green.600"
                  w="xs"
                  color="white"
                  _placeholder={{ color: 'white' }}
                  data-testid="search-input"
                />
              </InputGroup>
            </Box>
          )}
          <TokenDisplay />
          <UserMenu />
        </Flex>
      )}
    </Flex>
  );
};
