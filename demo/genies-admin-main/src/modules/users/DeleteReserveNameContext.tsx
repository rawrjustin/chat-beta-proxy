import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  ModalOverlay,
  ModalContent,
  useDisclosure,
  useToast,
} from 'src/theme';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { useMutation } from '@apollo/client';
import { deleteReservedUsernamesMutation } from 'src/edge/gql/admin/deleteReservedUsernamesMutation';
import Logger from 'shared/logger';

interface DeleteReserveNameProps {
  onOpen: () => void;
  setName: React.Dispatch<React.SetStateAction<string>>;
  deletedName: string[];
}

const DeleteReserveNameContext = React.createContext<DeleteReserveNameProps>(
  {} as DeleteReserveNameProps,
);

export const DeleteReserveNameProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [name, setName] = useState('');
  const [deletedName, setDeletedName] = useState([]);
  const { onOpen, isOpen, onClose } = useDisclosure();
  const [isRuning, setIsRuning] = useState(false);
  const adminClient = useAdminClient();
  const [deleteReservedUsername] = useMutation(
    deleteReservedUsernamesMutation,
    {
      client: adminClient,
    },
  );
  const toast = useToast();

  const deleteReservedUsernameHandler = async () => {
    setIsRuning(true);
    const payload = {
      variables: {
        input: {
          username: name,
        },
      },
    };

    const { errors } = await deleteReservedUsername(payload);
    if (errors) {
      Logger.getInstance().error(`delete Reserved Username error`, {
        errorMessage: errors?.[0]?.message,
        source: 'deleteReservedUsernameHandler',
      });
      toast({
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
        title: 'Graphql Error',
        description: `Delete Reserved Username mutation error:  ${errors?.[0]?.message}`,
      });
    } else {
      toast({
        title: 'Successfully delete reserved username: ' + name,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
      setDeletedName([...deletedName, name]);
      onClose();
    }
    setIsRuning(false);
  };

  return (
    <React.Fragment>
      <DeleteReserveNameContext.Provider
        value={{ onOpen, setName, deletedName }}
      >
        {children}
      </DeleteReserveNameContext.Provider>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete the Reserve Username</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Confirm to delete the reserved username: {name}?
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              color="black"
              backgroundColor="users.purple"
              onClick={deleteReservedUsernameHandler}
              isDisabled={isRuning}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export const useDeleteReserveName = () => {
  const context = React.useContext(DeleteReserveNameContext);
  return context;
};
