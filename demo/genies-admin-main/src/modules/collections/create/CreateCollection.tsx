import React, { ReactElement, useState } from 'react';
import {
  Table,
  Tbody,
  Tr,
  Td,
  Text,
  Textarea,
  FormControl,
  Input,
  Box,
} from 'src/theme';
import { NewCollectionProps } from './CreateCollectionContainer';

export const getOptionLabelFormat = (option, context) => {
  if (
    context.context === 'menu' &&
    context.selectValue.length &&
    context.selectValue[0].value === option.value
  ) {
    return (
      <Box display="flex" justifyContent="space-between">
        <React.Fragment>{option.label}</React.Fragment>
      </Box>
    );
  }

  return option.label;
};

export interface InputConfig {
  label: string;
  key: string | string[];
  isRequired?: boolean;
  isOnchain?: boolean;
  render?: (v?: any, onChange?: (event: any) => void) => ReactElement;
}

interface CreateCollectionProps {
  newCollectionInfo: NewCollectionProps;
  setNewCollectionInfo: React.Dispatch<
    React.SetStateAction<NewCollectionProps>
  >;
}

export const CreateCollection = ({
  newCollectionInfo,
  setNewCollectionInfo,
}: CreateCollectionProps) => {
  const [hoverRow, setHoverRow] = useState<number>(-1);

  const handleChange = (event) => {
    setNewCollectionInfo({
      ...newCollectionInfo,
      [event.target.name]: event.target.value,
    });
  };

  const createCollectionConfig: InputConfig[] = [
    { label: 'Name', key: 'title', isRequired: true, isOnchain: true },
    {
      label: 'Description',
      key: ['metadata', 'description'],
      isRequired: true,
      isOnchain: false,
      render: (v: string, onChange) => {
        return (
          <Textarea
            name="description"
            value={newCollectionInfo.description}
            onChange={onChange}
            placeholder="Enter Description..."
          />
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <Table>
        <Tbody>
          {createCollectionConfig.map((fieldConfig, index: number) => {
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
                        newCollectionInfo[fieldConfig.key as string],
                        handleChange,
                      )
                    ) : (
                      <Input
                        onChange={handleChange}
                        name={fieldConfig.key as string}
                        placeholder={fieldConfig.label}
                        defaultValue={
                          newCollectionInfo[fieldConfig.key as string]
                        }
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
