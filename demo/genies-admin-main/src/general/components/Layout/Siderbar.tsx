import React, { ReactText } from 'react';
import {
  Flex,
  useColorModeValue,
  FlexProps,
  Link,
  Icon,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from 'src/theme';
import {
  HiOutlineUserGroup as UserGroup,
  HiOutlinePuzzle as Experience,
  HiOutlineCubeTransparent as Gears,
  HiOutlineCollection as Things,
  HiOutlineChartPie as Trait,
  HiOutlineCash as Cash,
  HiOutlineArchive as Inventory,
  HiOutlineTemplate as Template,
  HiOutlineDatabase as Database,
  HiOutlineFlag as Moderation,
} from 'react-icons/hi';
import { IconType } from 'react-icons';
import {
  users,
  experiences,
  gears,
  currencyProducts,
  things,
  traits,
  economy,
  currencies,
  inventory,
  inventoryDefaultItems,
  inventoryMetadataStores,
  inventoryModeration,
} from 'src/modules/routes';
import { useRouter } from 'next/router';
import { useGetFeatureFlags, AdminFeatureFlags } from 'src/lib/statsig';

interface LinkItemProps {
  name: string;
  url: string;
  icon: IconType;
  section?: string;
}

interface SectionConfig {
  title: string;
  links: LinkItemProps[];
}

const sections: SectionConfig[] = [
  {
    title: 'General',
    links: [
      { name: 'Users', icon: UserGroup, url: users() },
      { name: 'Experiences', icon: Experience, url: experiences() },
      { name: 'Gears', icon: Gears, url: gears() },
      { name: 'Things', icon: Things, url: things() },
      { name: 'Traits', icon: Trait, url: traits() },
    ],
  },
  {
    title: 'Inventory',
    links: [
      { name: 'Inventory', icon: Inventory, url: inventory() },
      { name: 'Default Items', icon: Template, url: inventoryDefaultItems() },
      {
        name: 'Metadata Stores',
        icon: Database,
        url: inventoryMetadataStores(),
      },
      {
        name: 'Moderation',
        icon: Moderation,
        url: inventoryModeration(),
      },
    ],
  },
  {
    title: 'Economy',
    links: [
      { name: 'Transaction History', icon: Trait, url: economy() },
      { name: 'Currencies', icon: Cash, url: currencies() },
      { name: 'Currency Products', icon: Trait, url: currencyProducts() },
    ],
  },
];

interface NavItemProps extends FlexProps {
  children: ReactText;
  icon: IconType;
  url: string;
}

const NavItem = ({ children, icon, url, ...rest }: NavItemProps) => {
  return (
    <Link
      href={url}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        h={10}
        pl={2}
        my={3}
        {...rest}
      >
        {icon && <Icon mr="2" boxSize={6} as={icon} />}
        {children}
      </Flex>
    </Link>
  );
};

export const SidebarContent = () => {
  const router = useRouter();
  const enableUserMenu = useGetFeatureFlags(AdminFeatureFlags.ENABLE_USER_MENU);
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const sectionTitleColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Flex
      transition="3s ease"
      borderRight="1px"
      borderRightColor={borderColor}
      display="block"
      w="3xs"
      px={2}
      h="full"
      pt={9}
      overflowY="auto"
    >
      <Accordion defaultIndex={[0, 1, 2]} allowMultiple>
        {sections.map((section, index) => (
          <AccordionItem key={section.title} border="none" mb={2}>
            <AccordionButton
              px={2}
              py={2}
              _hover={{ bg: 'transparent' }}
              _expanded={{ bg: 'transparent' }}
            >
              <Box flex="1" textAlign="left">
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color={sectionTitleColor}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {section.title}
                </Text>
              </Box>
              <AccordionIcon color={sectionTitleColor} />
            </AccordionButton>
            <AccordionPanel px={0} pb={2}>
              {section.links.map((link) => {
                if (link.name === 'Users' && !enableUserMenu) return null;
                const isOnPath = router.pathname.startsWith(link.url);
                return (
                  <NavItem
                    key={link.name}
                    icon={link.icon}
                    url={link.url}
                    background={isOnPath ? 'gray.700' : ''}
                    data-testid={`${link.name}-button`}
                  >
                    {link.name}
                  </NavItem>
                );
              })}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Flex>
  );
};
