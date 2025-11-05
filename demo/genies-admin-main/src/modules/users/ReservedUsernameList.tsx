import React, { useEffect, useMemo, useState } from 'react';
import {
  Text,
  useToast,
  Container,
  Stack,
  InputGroup,
  InputLeftElement,
  Input,
  PhoneIcon,
  UseToastOptions,
  Button,
} from 'src/theme';
import { ColumnDef } from '@tanstack/react-table';
import { UnlimitedDataTable } from 'src/general/datatable';
import { useQuery, useMutation } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { searchReservedUsernamesQuery } from 'src/edge/gql/admin/searchReservedUsernamesQuery';
import { searchReservedUsernames_searchReservedUsernames_reservedUsernames as ReservedUsername } from 'src/edge/__generated/types/admin/searchReservedUsernames';
import { upsertReserveUsernamesMutation } from 'src/edge/gql/admin/upsertReservedUsernamesMutation';
import { SearchReservedUsernamesInput } from 'src/edge/__generated/types/admin/globalTypes';
import Logger from 'shared/logger';
import { useForm } from 'react-hook-form';
import { HiOutlineUser } from 'react-icons/hi';
import { TableRowActions } from 'src/general/infotable/TableRowActions';
import { useDeleteReserveName } from 'src/modules/users/DeleteReserveNameContext';
import { HiTrash } from 'react-icons/hi';

const PAGESIZE = 20;

export const ReservedUsernameList = () => {
  const adminClient = useAdminClient();
  const [upsertReserveUsernames] = useMutation(upsertReserveUsernamesMutation, {
    client: adminClient,
  });
  const [reservedNames, setReservedNames] = useState<ReservedUsername[]>([]);
  const {
    onOpen: openDeleteModal,
    setName: setDeleteReserveName,
    deletedName,
  } = useDeleteReserveName();

  //@Mountz - pass in _ as unused parameters for data.id, fieldKey
  //Since we are reusing the TableRowAction component, the updateData function is also used elsewhere
  const handleUpsertPhoneNumber = async (
    userName,
    _1,
    _2,
    newValue,
    rowIndex,
  ) => {
    let payload = {
      variables: {
        input: {
          upsertReservedUsernames: [
            {
              username: userName,
              phoneNumber: newValue,
            },
          ],
        },
      },
    };

    const { data: upsertData, errors } = await upsertReserveUsernames(payload);
    if (errors || upsertData.upsertReservedUsernames?.failures?.length) {
      Logger.getInstance().error(`Upsert Reserved Username error`, {
        errorMessage: errors?.[0]?.message,
        upertFailure: upsertData.upsertReservedUsernames?.failures,
        source: 'handleUpsertReserveUsernames',
      });
      const errorMsg = errors.length
        ? errors?.[0]?.message
        : `Failed to update phone number for ${userName}`;
      throw new Error(errorMsg);
    } else {
      if (upsertData) {
        setReservedNames((prev) => {
          const temp = [...prev];
          const idx = temp.findIndex((e) => e.username === userName);
          temp[idx].phoneNumber = newValue;
          return temp;
        });
      }
    }
  };

  const columns = useMemo<ColumnDef<ReservedUsername>[]>(
    () => [
      {
        id: 'username',
        header: () => <Text fontSize="md">Reserved Username</Text>,
        accessorKey: 'username',
        cell: (props) => <Text>{props.renderValue() as string}</Text>,
      },
      {
        id: 'phone',
        header: () => <Text fontSize="md">Phone Number</Text>,
        accessorKey: 'phoneNumber',
        cell: (props) => (
          <Button variant="unstyled" fontWeight="400">
            <Text>{props.renderValue() as string}</Text>
          </Button>
        ),
      },
      {
        id: 'edit',
        header: () => null,
        accessorKey: 'edit',
        cell: (props) => {
          return (
            <React.Fragment>
              <TableRowActions
                fieldConfig={{
                  label: 'Phone Number',
                  key: 'phoneNumber',
                  isEditable: true,
                  isOnchain: false,
                }}
                data={{
                  label: 'Phone Number',
                  phoneNumber: props.row.original.phoneNumber
                    ? props.row.original.phoneNumber
                    : '',
                }}
                hiddenActionRow={() => {}}
                updateData={(id, fieldKey, newValue) => {
                  handleUpsertPhoneNumber(
                    props.row.original.username,
                    id,
                    fieldKey,
                    newValue,
                    props.row.index,
                  );
                }}
                copyEnabled={false}
              />
            </React.Fragment>
          );
        },
      },
      {
        id: 'delete',
        header: () => null,
        accessorKey: 'delete',
        cell: (props) => {
          const toDeleteName = props.row.original.username;
          return (
            <Button
              size="md"
              color="users.purple"
              variant="ghost"
              leftIcon={<HiTrash />}
              onClick={() => {
                setDeleteReserveName(toDeleteName);
                openDeleteModal();
              }}
            >
              Delete
            </Button>
          );
        },
      },
    ],
    [],
  );

  const { register, handleSubmit, getValues, setValue } = useForm();
  const [cursor, setCursor] = useState<string>('');

  const toast = useToast();
  const searchOption: SearchReservedUsernamesInput = {
    filters: {
      byUsernames: [],
    },
    pageSize: PAGESIZE,
    cursor: null,
  };
  const { data, loading, refetch, error } = useQuery(
    searchReservedUsernamesQuery,
    {
      variables: {
        searchInput: searchOption,
      },
      client: adminClient,
      fetchPolicy: 'no-cache',
    },
  );
  const toastProp: UseToastOptions = {
    status: 'error',
    duration: 5000,
    isClosable: true,
    position: 'top',
  };
  if (error) {
    toast({
      ...toastProp,
      title: 'Graphql Error',
      description: `Search Reserved Username query error:  ${error?.message}`,
    });
    Logger.getInstance().error(
      `Search Reserved Username query error:  ${error?.message}`,
      {
        errorMessage: error,
        source: 'searchReservedUsernamesQuery',
      },
    );
  }
  useEffect(() => {
    const inputOptions = getValues();
    const isContainFilters =
      inputOptions?.username.length || inputOptions?.phoneNumber.length;
    if (isContainFilters) {
      setCursor(null);
      setReservedNames(data.searchReservedUsernames.reservedUsernames);
    } else {
      const currentCursor = data?.searchReservedUsernames?.pageInfo?.nextCursor;
      if (!currentCursor || currentCursor?.length < 10) {
        setCursor(null);
      } else {
        setCursor(currentCursor);
      }
      if (data) {
        setReservedNames((prevData) => {
          return prevData.concat(
            data.searchReservedUsernames.reservedUsernames,
          );
        });
      }
    }
  }, [data, getValues]);

  useEffect(() => {
    if (deletedName.length > 0) {
      const reservedNameAfterDeleting = reservedNames.filter(
        (e) => !deletedName.includes(e.username),
      );
      setReservedNames(reservedNameAfterDeleting);
    }
    // solely depend on the deletedName variable and not on reservedNames.
    // so disable the eslint next line
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedName]);

  const handleFetchMore = async () => {
    try {
      await refetch({
        searchInput: { ...searchOption, cursor },
      });
    } catch (e) {
      toast({
        ...toastProp,
        title: 'Graphql refecth Error',
        description: `Search Reserved Username Query Refectch error:  ${e?.message}`,
      });
      Logger.getInstance().error(
        `Search Reserved Username Query Refectch error:  ${e?.message}`,
        {
          errorMessage: e?.message,
          source: 'searchReservedUsernamesQuery refetch',
        },
      );
    }
  };

  const handleSearch = async (inputOptions) => {
    const inputSearchOptions = searchOption;
    inputSearchOptions.filters.byUsernames = inputOptions?.username?.length
      ? [inputOptions?.username]
      : [];
    if (inputOptions?.phoneNumber?.length) {
      inputSearchOptions.filters['byPhoneNumber'] = inputOptions?.phoneNumber;
    }
    setReservedNames([]);
    try {
      await refetch({ searchInput: inputSearchOptions });
    } catch (e) {
      toast({
        ...toastProp,
        title: 'Graphql refecth Error',
        description: `Search Reserved Username Query Search error:  ${e?.message}`,
      });
      Logger.getInstance().error(
        `Search Reserved Username Query Search error:  ${e?.message}`,
        {
          errorMessage: e?.message,
          source: 'searchReservedUsernamesQuery handleSearch',
          inputSearchOptions,
        },
      );
    }
  };

  const handleClear = async () => {
    setValue('username', '');
    setValue('phoneNumber', '');
    setReservedNames([]);
    try {
      await refetch({ searchInput: searchOption });
    } catch (e) {
      toast({
        ...toastProp,
        title: 'Graphql refecth Error',
        description: `Search Reserved Username Query search error:  ${e?.message}`,
      });
      Logger.getInstance().error(
        `Search Reserved Username Query search error:  ${e?.message}`,
        {
          errorMessage: e?.message,
          source: 'searchReservedUsernamesQuery handleClear',
        },
      );
    }
  };

  return (
    <Container centerContent maxW="4xl">
      <Stack spacing={4} direction="row" mt={4} mb={12} w="full">
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            color="gray.300"
            fontSize="1.2em"
          >
            <HiOutlineUser color="gray.300" />
          </InputLeftElement>
          <Input placeholder="Reserved Username" {...register('username')} />
        </InputGroup>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <PhoneIcon color="gray.300" />
          </InputLeftElement>
          <Input placeholder="Phone number" {...register('phoneNumber')} />
        </InputGroup>
        <Button w="md" colorScheme="blue" onClick={handleSubmit(handleSearch)}>
          Search
        </Button>
        <Button w="md" colorScheme="blue" onClick={handleClear}>
          Clear
        </Button>
      </Stack>

      <UnlimitedDataTable
        columns={columns}
        data={reservedNames}
        loading={loading}
        handleFetchMore={handleFetchMore}
        cursor={cursor}
      />
    </Container>
  );
};
