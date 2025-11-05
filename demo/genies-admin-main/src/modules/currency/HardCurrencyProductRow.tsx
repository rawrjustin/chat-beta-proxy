import React, { useState, useEffect } from 'react';
import { Button, Checkbox, Flex, Image, Input, Tr, Td } from '../../theme';
import { HardCurrencyProductView } from './HardCurrencyProductView';
import { KEY_PREFIX, URL_PREFIX } from '../../pages/api/uploadCurrency';

export const HardCurrencyProductRow = ({
  rowData,
  onSave,
  onCancel,
}: {
  rowData: HardCurrencyProductView;
  onSave: (product: HardCurrencyProductView) => void;
  onCancel: Function;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState<HardCurrencyProductView>({
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
            minWidth={360}
            type="text"
            name="appleProductId"
            value={updatedData.appleProductId}
            onChange={handleInputTextChange}
          />
        </Td>
        <Td>
          <Input
            minWidth={360}
            type="text"
            name="googleProductId"
            value={updatedData.googleProductId}
            onChange={handleInputTextChange}
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
          </Flex>
        </Td>
      </Tr>
    );
  } else {
    // "https://d2l8qduyi045tz.cloudfront.net/currency/store_icons/hc_small.png"
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
        <Td>{rowData.appleProductId}</Td>
        <Td>{rowData.googleProductId}</Td>
        <Td>{rowData.title}</Td>
        <Td>{rowData.description}</Td>
        <Td>
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        </Td>
      </Tr>
    );
  }
};
