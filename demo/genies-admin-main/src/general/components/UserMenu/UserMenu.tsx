import React, { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
} from 'src/theme';
import { HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
import { useAuth, getTokens, getUserFromAccessToken } from 'src/lib/auth';
import { useRouter } from 'next/router';

export const UserMenu = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const tokens = getTokens();
    if (tokens.accessToken) {
      const user = getUserFromAccessToken(tokens.accessToken);
      if (user?.userId) {
        setUserId(user.userId);
      }
    }
  }, []);

  const handleSignOut = async () => {
    signOut();
  };

  const handleGoToProfile = () => {
    if (userId) {
      router.push(`/users/${userId}`);
    }
  };

  return (
    <Box mr={6}>
      <Menu>
        <MenuButton
          as={Box}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ opacity: 0.8 }}
          data-testid="user-menu-button"
        >
          <Avatar
            size="md"
            src="/static/images/avatar.svg"
            data-testid="user-icon"
          />
        </MenuButton>
        <MenuList bg="gray.800" borderColor="gray.600">
          <MenuItem
            icon={<HiOutlineUser />}
            onClick={handleGoToProfile}
            bg="gray.800"
            _hover={{ bg: 'gray.700' }}
            color="white"
            isDisabled={!userId}
            data-testid="my-profile-menu-item"
          >
            <Text>My Profile</Text>
          </MenuItem>
          <MenuItem
            icon={<HiOutlineLogout />}
            onClick={handleSignOut}
            bg="gray.800"
            _hover={{ bg: 'gray.700' }}
            color="white"
            data-testid="sign-out-menu-item"
          >
            <Text>Sign Out</Text>
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};
