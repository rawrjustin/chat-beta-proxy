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
  Flex,
  Image,
} from 'src/theme';
import { Select, GroupBase } from 'chakra-react-select';
import {
  EditionOption,
  NewDropProps,
} from 'src/modules/drops/create/CreateDropContainer';
import { FileUploadComponent } from 'src/general/components/Image/FileUploadComponent';

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
  render?: (v?: any, onChange?: (event: any) => void) => ReactElement;
}

interface CreateDropProps {
  newDropInfo: NewDropProps;
  setNewDropInfo: React.Dispatch<React.SetStateAction<NewDropProps>>;
  formattedEditionData: EditionOption[];
  editionPrice: { [key: string]: number };
  setEditionPrice: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  imageFile: File;
  setImageFile: React.Dispatch<React.SetStateAction<File>>;
  selectedEdition: EditionOption[];
  setSelectedEdition: React.Dispatch<React.SetStateAction<EditionOption[]>>;
}

export const CreateDrop = ({
  newDropInfo,
  setNewDropInfo,
  formattedEditionData,
  editionPrice,
  setEditionPrice,
  imageFile,
  setImageFile,
  selectedEdition,
  setSelectedEdition,
}: CreateDropProps) => {
  const [hoverRow, setHoverRow] = useState<number>(-1);

  const handleChange = (event) => {
    setNewDropInfo({ ...newDropInfo, [event.target.name]: event.target.value });
  };

  const handlePriceUpdate = (editionId, price) => {
    setEditionPrice((prev) => {
      return { ...prev, [editionId]: price };
    });
  };
  const createDropConfig: InputConfig[] = [
    {
      label: 'Image',
      key: 'image',
      isRequired: true,
      render: (v: any, onChange) => {
        return (
          <FileUploadComponent
            imageURL={v?.imageURL}
            imageFile={imageFile}
            setImageFile={setImageFile}
          />
        );
      },
    },
    { label: 'Name', key: 'title', isRequired: true },
    {
      label: 'Description',
      key: 'description',
      isRequired: true,
      render: (v: string, onChange) => {
        return (
          <Textarea
            name="description"
            value={v}
            onChange={onChange}
            placeholder="Enter Description..."
          />
        );
      },
    },
    {
      label: 'Start time (PDT)',
      key: 'startTime',
      isRequired: false,
      render: (v: string, onChange) => (
        <Input
          mb={2}
          name="startTime"
          type="datetime-local"
          placeholder="Enter New Start Time"
          value={v}
          onChange={onChange}
        />
      ),
    },
    {
      label: 'End time (PDT)',
      key: 'endTime',
      isRequired: false,
      render: (v: string, onChange) => (
        <Input
          mb={2}
          name="endTime"
          type="datetime-local"
          placeholder="Enter New End Time"
          value={v}
          onChange={onChange}
        />
      ),
    },
    {
      label: 'Select Editions',
      key: 'editions',
      isRequired: true,
      render: () => {
        return (
          <Box>
            <Select<EditionOption, true, GroupBase<EditionOption>>
              isMulti
              name="editions"
              options={formattedEditionData}
              placeholder="Select editions"
              closeMenuOnSelect={false}
              formatOptionLabel={(option, context) => {
                return context.context === 'menu' ? (
                  <Box display="flex" alignItems="center">
                    {option.imageUrl && (
                      <Image w="10" h="10" src={option.imageUrl} alt="" />
                    )}
                    <span>&nbsp;{option.label}</span>
                  </Box>
                ) : (
                  <Box>
                    {option.imageUrl ? (
                      <Image w="10" h="10" src={option.imageUrl} alt="" />
                    ) : (
                      <span>{option.label}</span>
                    )}
                  </Box>
                );
              }}
              onChange={(editions) => {
                const editionArray = Array.from(editions);
                setSelectedEdition(editionArray);
                const newEditionPrice = editions.reduce((prev, e) => {
                  return { ...prev, [e.value]: 0 };
                }, {});
                Object.keys(newEditionPrice).forEach((key) => {
                  if (editionPrice[key]) {
                    newEditionPrice[key] = editionPrice[key];
                  }
                });
                setEditionPrice(newEditionPrice);
              }}
            />
            {selectedEdition.length > 0 && (
              <Flex direction="column" mt={4} mb={4}>
                <Flex justifyContent="space-between">
                  <Flex justifyContent="center" w="full" flex={1}>
                    <Text fontSize={20}>Editions</Text>
                  </Flex>
                  <Flex justifyContent="center" w="full" flex={1}>
                    <Text fontSize={20}>Price</Text>
                  </Flex>
                </Flex>
                {selectedEdition.map((edition, idx) => {
                  return (
                    <Flex key={idx} justifyContent="space-between" mt={4}>
                      <Flex
                        alignItems="center"
                        justifyContent="center"
                        flex={1}
                      >
                        <Image
                          w="10"
                          h="10"
                          src={
                            edition.imageUrl
                              ? edition.imageUrl
                              : '/static/images/transparentbox.svg'
                          }
                          alt=""
                        />
                        <Text ml={4}>{edition.label}</Text>
                      </Flex>
                      <Flex mr={4} justifyContent="center" flex={1}>
                        <Input
                          w="100px"
                          onChange={(e) => {
                            handlePriceUpdate(
                              edition.value,
                              parseInt(e.target.value),
                            );
                          }}
                          value={
                            editionPrice[edition.value]
                              ? editionPrice[edition.value]
                              : 0
                          }
                        />
                      </Flex>
                    </Flex>
                  );
                })}
              </Flex>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <Table>
        <Tbody>
          {createDropConfig.map((fieldConfig, index: number) => {
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
                    {fieldConfig.isRequired
                      ? `${fieldConfig.label} *`
                      : fieldConfig.label}
                  </Text>
                </Td>
                <Td maxW="3xl">
                  <FormControl isRequired={fieldConfig.isRequired}>
                    {fieldConfig.render ? (
                      fieldConfig.render(
                        newDropInfo[fieldConfig.key as string],
                        handleChange,
                      )
                    ) : (
                      <Input
                        onChange={handleChange}
                        name={fieldConfig.key as string}
                        placeholder={fieldConfig.label}
                        value={newDropInfo[fieldConfig.key as string]}
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
