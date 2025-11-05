import React, { useState, useEffect } from 'react';
import {
  Button,
  Checkbox,
  Flex,
  Input,
  Tr,
  Td,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Popover,
  Image,
} from '../../theme';
import { SoftCurrencyProductView } from './SoftCurrencyProductView';
import deleteSoftCurrencyProduct from '../../edge/shim/economy/deleteSoftCurrencyProduct';
import { KEY_PREFIX, URL_PREFIX } from '../../pages/api/uploadCurrency';

export const SoftCurrencyProductRow = ({
  rowData,
  onSave,
  onCancel,
  onDelete,
}: {
  rowData: SoftCurrencyProductView;
  onSave: (product: SoftCurrencyProductView) => void;
  onCancel: Function;
  onDelete: (rowId: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState<SoftCurrencyProductView>({
    ...rowData,
  });

  useEffect(() => {
    setUpdatedData({ ...rowData });
  }, [rowData]);

  const handleInputNumberChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue)) {
      setUpdatedData({ ...updatedData, [name]: parsedValue });
    } else {
      setUpdatedData({ ...updatedData, [name]: value });
    }
  };

  const handleInputTextChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData({ ...updatedData, [name]: value });
  };

  const handleInputCheckChange = (e) => {
    setUpdatedData({ ...updatedData, [e.target.name]: e.target.checked });
  };

  const handleSave = () => {
    onSave(updatedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setUpdatedData({ ...rowData });
    setIsEditing(false);
    onCancel();
  };

  const handleDelete = async () => {
    let response = await deleteSoftCurrencyProduct(
      rowData.currencyId,
      rowData.productSku,
    );
    if (response) {
      onDelete(rowData.rowId);
    } else {
      console.error('failed to delete soft currency product');
    }
  };

  const handleVoid = () => {};

  const handleInputFileIconChange = async (event) => {
    let file: File = event.target.files[0];
    let url = `${KEY_PREFIX}/${file.name}`;
    setUpdatedData({ ...updatedData, iconUrl: url, iconFile: file });
  };

  if (isEditing) {
    return (
      <Tr>
        <Td>
          <Input
            width={124}
            minHeight={50}
            maxHeight={100}
            type="file"
            name="iconUrl"
            onChange={handleInputFileIconChange}
          />
        </Td>
        <Td>
          <Input
            minWidth={100}
            type="text"
            name="productSku"
            value={updatedData.productSku}
            onChange={handleInputTextChange}
          />
        </Td>
        <Td>
          <Input
            minWidth={50}
            type="number"
            name="amount"
            value={updatedData.amount}
            onChange={handleInputNumberChange}
          />
        </Td>
        <Td>
          <Checkbox
            display={updatedData.isActive ? 'true' : 'false'}
            name="isActive"
            isChecked={updatedData.isActive}
            onChange={handleInputCheckChange}
          />
        </Td>
        <Td>
          <Input
            minWidth={50}
            type="number"
            name="hcCost"
            value={updatedData.hcCost}
            onChange={handleInputNumberChange}
          />
        </Td>
        <Td>
          <Input
            minWidth={75}
            type="text"
            name="title"
            value={updatedData.title}
            onChange={handleInputTextChange}
          />
        </Td>
        <Td>
          <Input
            minWidth={75}
            type="text"
            name="description"
            value={updatedData.description}
            onChange={handleInputTextChange}
          />
        </Td>
        <Td>
          <Flex flexDirection="row">
            <Button onClick={handleSave}>Save</Button>
            <Button onClick={handleCancel}>Cancel</Button>
            <Popover>
              <PopoverTrigger>
                <Button onClick={handleVoid}>Delete</Button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverBody
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={3}
                >
                  <Button onClick={handleDelete}>Confirm delete product</Button>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Flex>
        </Td>
      </Tr>
    );
  } else {
    // "https://d2l8qduyi045tz.cloudfront.net/currency/store_icons/sc_small.png"
    let cdnIconUrl = `${URL_PREFIX}/${rowData.iconUrl}`;
    return (
      <Tr>
        <Td>
          <Image
            src={cdnIconUrl}
            alt={rowData.iconUrl}
            maxWidth={50}
            maxHeight={50}
          />
        </Td>
        <Td>{rowData.productSku}</Td>
        <Td>{rowData.amount}</Td>
        <Td>{rowData.isActive ? 'true' : 'false'}</Td>
        <Td>{rowData.hcCost}</Td>
        <Td>{rowData.title}</Td>
        <Td>{rowData.description}</Td>
        <Td>
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        </Td>
      </Tr>
    );
  }
};
