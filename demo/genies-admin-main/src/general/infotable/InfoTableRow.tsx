import React, { Fragment } from 'react';
import { Text, Td } from 'src/theme';
import { TableRowActions } from './TableRowActions';
import {
  FieldConfig,
  getValueByConfig,
} from 'src/modules/collections/details/CollectionDetailForm';

interface Props {
  contentColor: string;
  labelColor: string;
  fieldConfig: FieldConfig;
  data: { [key: string]: any };
  showAction: boolean;
  render?(
    v: any,
  ): React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  setHoverRow(idx): void;
  updateData(
    id: string,
    field: string | string[],
    newData: string | object,
  ): void;
}

export const InfoTableRow = ({
  contentColor,
  labelColor,
  fieldConfig,
  data,
  showAction,
  render,
  setHoverRow,
  updateData,
}: Props) => {
  return (
    <Fragment>
      <Td maxW="2xs">
        <Text color={labelColor}>
          {fieldConfig.label}
          {fieldConfig.isOnchain && <sup>Onchain</sup>}
        </Text>
      </Td>
      <Td maxW="xs">
        {render ? (
          render(getValueByConfig(data, fieldConfig))
        ) : (
          <Text w="full" textStyle="userDetailFont" color={contentColor}>
            {getValueByConfig(data, fieldConfig)}
          </Text>
        )}
      </Td>
      <Td maxW="3xs" visibility={showAction ? 'visible' : 'hidden'}>
        <TableRowActions
          fieldConfig={fieldConfig}
          data={data}
          hiddenActionRow={() => {
            setHoverRow(-1);
          }}
          updateData={updateData}
        />
      </Td>
    </Fragment>
  );
};
