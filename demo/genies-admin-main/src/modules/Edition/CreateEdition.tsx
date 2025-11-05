import React, { ReactElement, useState } from 'react';
import {
  Table,
  Tbody,
  Tr,
  Td,
  Text,
  FormControl,
  Input,
  Select,
  Container,
} from 'src/theme';
import { NewEditionProps } from './CreateEditionContainer';
import { FileUploadComponent } from 'src/general/components/Image/FileUploadComponent';
import { UploadType } from 'src/general/components/Image/Dropzone';
import {
  EditionDesignSlot,
  EditionRarity,
} from 'src/edge/__generated/types/admin/globalTypes';

export interface InputConfig {
  label: string;
  key: string | string[];
  isRequired?: boolean;
  isOnchain?: boolean;
  render?: (v?: any, onChange?: (event: any) => void) => ReactElement;
}

interface CreateEditionProps {
  newEditionInfo: NewEditionProps;
  setNewEditionInfo: React.Dispatch<React.SetStateAction<NewEditionProps>>;
  imageFile: File;
  setImageFile: React.Dispatch<React.SetStateAction<File>>;
  savedImageUrl?: string;
}

export const CreateEdition = ({
  newEditionInfo,
  setNewEditionInfo,
  imageFile,
  setImageFile,
  savedImageUrl,
}: CreateEditionProps) => {
  const [hoverRow, setHoverRow] = useState<number>(-1);

  const handleChange = (event) => {
    setNewEditionInfo({
      ...newEditionInfo,
      [event.target.name]: event.target.value,
    });
  };

  const CreateEditionConfig: InputConfig[] = [
    {
      label: 'Image',
      key: 'image',
      isRequired: true,
      isOnchain: false,
      render: (v: any, onChange) => {
        return (
          <Container centerContent>
            <FileUploadComponent
              imageURL={savedImageUrl}
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploadType={UploadType.ZIP}
            />
          </Container>
        );
      },
    },
    { label: 'Name', key: 'name', isRequired: true, isOnchain: true },
    { label: 'Description', key: 'description', isRequired: true },
    {
      label: 'Publisher',
      key: 'publisher',
      isRequired: true,
      isOnchain: true,
    },
    {
      label: 'Rarity',
      key: 'rarity',
      isRequired: true,
      isOnchain: true,
      render: () => {
        return (
          <Select
            name="rarity"
            placeholder="Select Rarity"
            onChange={handleChange}
            value={newEditionInfo.rarity}
          >
            {Object.keys(EditionRarity).map((editionRarity) => (
              <option key={editionRarity} value={editionRarity}>
                {editionRarity}
              </option>
            ))}
          </Select>
        );
      },
    },
    {
      label: 'Design Slot',
      key: 'designSlot',
      isRequired: true,
      isOnchain: true,
      render: () => {
        return (
          <Select
            name="designSlot"
            placeholder="Select Design Slot"
            onChange={handleChange}
            value={newEditionInfo.designSlot}
          >
            {Object.keys(EditionDesignSlot).map((designSlot) => (
              <option key={designSlot} value={designSlot}>
                {designSlot}
              </option>
            ))}
          </Select>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <Table>
        <Tbody>
          {CreateEditionConfig.map((fieldConfig, index: number) => {
            const showAction = index === hoverRow;
            const labelColor = showAction ? 'users.purple' : 'gray.400';
            return (
              <Tr
                key={index}
                onMouseEnter={() => setHoverRow(index)}
                onMouseLeave={() => setHoverRow(-1)}
              >
                <Td w="2xs">
                  <Text w="full" textStyle="userDetailFont" color={labelColor}>
                    {fieldConfig.label}
                    {fieldConfig.isOnchain && <sup>Onchain</sup>}
                    {fieldConfig.isRequired && ' *'}
                  </Text>
                </Td>
                <Td maxW="3xl">
                  <FormControl isRequired={fieldConfig.isRequired}>
                    {fieldConfig.render ? (
                      fieldConfig.render(
                        newEditionInfo[fieldConfig.key as string],
                        handleChange,
                      )
                    ) : (
                      <Input
                        onChange={handleChange}
                        name={fieldConfig.key as string}
                        placeholder={fieldConfig.label}
                        defaultValue={newEditionInfo[fieldConfig.key as string]}
                      />
                    )}
                  </FormControl>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </React.Fragment>
  );
};
