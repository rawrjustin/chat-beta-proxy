import React, { SyntheticEvent } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useDisclosure,
  Icon,
  Flex,
} from 'src/theme';
import {
  HiDotsVertical as DotsVertical,
  HiOutlineDownload as Download,
  HiOutlineTrash as Trash,
} from 'react-icons/hi';
import { Collection } from 'src/modules/collections';
import { Drop } from 'src/modules/drops';

export const MoreActionMenu = ({
  selectedData,
}: {
  selectedData: Collection[] | Drop[];
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleDelete = (e: SyntheticEvent) => {
    e.preventDefault();
    console.log('Delete Callback');
    console.log(selectedData);
  };
  const handleExport = (e: SyntheticEvent) => {
    e.preventDefault();
    console.log('Export Callback');
    console.log(selectedData);
  };
  return (
    <Menu isOpen={isOpen} placement="bottom-end">
      <MenuButton
        cursor="pointer"
        width={6}
        height={6}
        aria-label="More Actions"
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
      >
        <Icon boxSize={5} color="users.purple" as={DotsVertical} />
      </MenuButton>
      <MenuList onMouseEnter={onOpen} onMouseLeave={onClose}>
        <MenuItem onClick={handleExport}>
          <Flex w="full" h={6} align="center" justify="center">
            <Icon boxSize={5} mr={2} color="users.purple" as={Download} />
            <Text fontSize="md" color="users.purple">
              Export
            </Text>
          </Flex>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Flex w="full" h={6} align="center" justify="center">
            <Icon boxSize={5} mr={2} color="users.purple" as={Trash} />
            <Text fontSize="md" color="users.purple">
              Delete
            </Text>
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
