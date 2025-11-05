import React, { useState, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Th,
  Tr,
  Td,
  Container,
  Flex,
  useToast,
} from 'src/theme';
import { FileUploadComponent } from 'src/general/components/Image/FileUploadComponent';
import { UploadType } from 'src/general/components/Image/Dropzone';
import Papa from 'papaparse';
import { ActionsContainer } from 'src/modules/Actions/Index';
import { BatchAddReservedUsernameAction } from '../Actions/BatchAddReservedUsernameAction';
import { DownloadBatchReserveTemplate } from '../Actions/DownloadBatchReserveTemplate';
import { UpsertReservedUsernameInput } from 'src/edge/__generated/types/admin/globalTypes';

const formatCSVData = (data) => {
  const res = [];
  for (let i = 1; i < data.length; i++) {
    try {
      const nameElement = { username: data[i][0] };
      if (data[i][1].length) nameElement['phoneNumber'] = data[i][1];
      res.push(nameElement);
    } catch (e) {}
  }
  return res;
};

export const ReserveUsernameContainer = () => {
  const toast = useToast();
  const [csvFile, setCSVFile] = useState<File>(null);
  const [reservedNames, setReservedNames] = useState<
    UpsertReservedUsernameInput[]
  >([]);

  useEffect(() => {
    if (csvFile) {
      Papa.parse(csvFile, {
        complete: (res) => {
          setReservedNames(formatCSVData(res?.data));
        },
        error: (error) => {
          toast({
            title: 'Error',
            description: error,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top',
          });
        },
        newline: '\n',
      });
    }
  }, [csvFile, toast]);

  return (
    <Flex>
      <Flex w="full" justify="center" flexDirection="column" mb={48}>
        <Container centerContent>
          <FileUploadComponent
            imageFile={csvFile}
            setImageFile={setCSVFile}
            uploadType={UploadType.CSV}
          />

          {reservedNames && reservedNames?.length > 0 && (
            <Table>
              <Thead>
                <Tr>
                  <Th>Id</Th>
                  <Th>Revsered Username</Th>
                  <Th>Phone</Th>
                </Tr>
              </Thead>
              <Tbody>
                {reservedNames.map((e, i) => (
                  <Tr key={i}>
                    <Td>{i + 1}</Td>
                    <Td>{e.username}</Td>
                    <Td>{e?.phoneNumber}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Container>
      </Flex>
      <Flex w="2xs" ml={25} mr={25} align="flex-start">
        <ActionsContainer>
          <BatchAddReservedUsernameAction reservedNames={reservedNames} />
          <DownloadBatchReserveTemplate />
        </ActionsContainer>
      </Flex>
    </Flex>
  );
};
