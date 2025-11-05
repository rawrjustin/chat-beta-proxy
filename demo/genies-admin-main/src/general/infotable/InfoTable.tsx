import React, { useState } from 'react';
import { MintEditionAction } from 'src/modules/Actions/MintEditionAction';
import {
  FieldConfig,
  getValueByConfig,
} from 'src/modules/collections/details/CollectionDetailForm';
import { Flex, Container, Table, Tbody, Tr, Td } from 'src/theme';
import { TableInitialLoadingSkeleton } from '../datatable/TableInitialLoadingSkeleton';
import { InfoTableRow } from './InfoTableRow';
import { ListForClaimAction } from 'src/general/infotable/ListForClaimAction';
import { ListForSaleAction } from './ListForSaleAction';
import { ListSetPriceAction } from './ListSetPriceAction';
import { PlatformStatus } from 'src/edge/__generated/types/admin/globalTypes';
import { ClaimCodeAction } from './ClaimCodeAction';

/**
 * In the dev new smart contract, the edition flow ID started from 1000.
 * So only the edition, whose flow id is greater than or equal with 1000, can be minted
 * The edition, whose flow id is less than 1000, will throw error when minted
 * But in the production, there is no this restriction.
 */
const isAcitveEdition = (editionFlowId) =>
  process.env.NEXT_PUBLIC_DATADOG_ENVIRONMENT === 'production'
    ? true
    : editionFlowId >= 1000;

interface InfoTableProps {
  data: { [key: string]: any };
  formConfig: FieldConfig[];
  loading: boolean;
  updateData(
    id: string,
    field: string | string[],
    newData: string | object,
  ): void;
  image?: React.ReactNode;
  editionId?: string;
  dropId?: string;
  refetch?: () => {};
}

export const InfoTable = ({
  data,
  loading,
  formConfig,
  updateData,
  image,
  editionId,
  dropId,
  refetch,
}: InfoTableProps) => {
  const [hoverRow, setHoverRow] = useState<number>(-1);

  return (
    <React.Fragment>
      <Container centerContent>{image}</Container>
      <Flex w="full">
        <Table>
          <Tbody>
            {loading || !data ? (
              <TableInitialLoadingSkeleton
                rowNum={formConfig.length}
                columnNum={3}
              />
            ) : (
              formConfig.map((fieldConfig, index: number) => {
                const showAction =
                  data.status === PlatformStatus.PUBLIC // Published Data should not be modified.
                    ? false
                    : fieldConfig.isEditable
                    ? index === hoverRow
                    : false;
                const labelColor = fieldConfig.isEditable
                  ? showAction
                    ? 'users.purple'
                    : 'gray.400'
                  : 'gray.400';
                const contentColor = fieldConfig.isEditable
                  ? showAction
                    ? 'users.purple'
                    : 'white'
                  : 'gray.600';

                const EditionFlowID = getValueByConfig(data, {
                  label: 'Edition Flow ID',
                  key: 'flowID',
                });

                const ShouldShowMintButton =
                  fieldConfig?.label === 'Edition Size' &&
                  isAcitveEdition(EditionFlowID);
                const shouldShowListForSale =
                  Array.from(fieldConfig?.key ?? '').some(
                    (id) => id === 'saleCount',
                  ) && isAcitveEdition(EditionFlowID);
                const ShouldShowListForClaim =
                  Array.from(fieldConfig?.key ?? '').some(
                    (id) => id === 'claimCount',
                  ) && isAcitveEdition(EditionFlowID);
                const shouldShowSetPrice =
                  fieldConfig?.label === 'Price' &&
                  isAcitveEdition(EditionFlowID) &&
                  data?.dropEditionID &&
                  data.dropEditionID.length > 0;

                const shouldShowClaimCodeButton =
                  Array.from(fieldConfig?.key ?? '').some(
                    (id) => id === 'claimCode',
                  ) && isAcitveEdition(EditionFlowID);

                const editionFlowId = getValueByConfig(data, {
                  label: 'Edition Flow ID',
                  key: 'flowID',
                });
                const NotShowEditionButton =
                  ShouldShowMintButton ||
                  shouldShowListForSale ||
                  ShouldShowListForClaim ||
                  shouldShowSetPrice ||
                  shouldShowClaimCodeButton;
                return (
                  <Tr
                    key={index}
                    onMouseEnter={
                      NotShowEditionButton ? () => {} : () => setHoverRow(index)
                    }
                    onMouseLeave={() => setHoverRow(-1)}
                  >
                    <InfoTableRow
                      render={fieldConfig.render}
                      contentColor={contentColor}
                      labelColor={labelColor}
                      data={data}
                      fieldConfig={fieldConfig}
                      showAction={showAction}
                      setHoverRow={setHoverRow}
                      updateData={updateData}
                    />
                    <Td w={10}>
                      {ShouldShowMintButton && (
                        <MintEditionAction
                          editionFlowID={editionFlowId}
                          editionSize={getValueByConfig(data, fieldConfig)}
                        />
                      )}
                      {shouldShowListForSale && (
                        <ListForSaleAction
                          editionFlowID={editionFlowId}
                          saleSize={getValueByConfig(data, fieldConfig)}
                          dropPrice={data?.dropPrice}
                        />
                      )}
                      {ShouldShowListForClaim && (
                        <ListForClaimAction
                          editionFlowID={editionFlowId}
                          claimSize={getValueByConfig(data, fieldConfig)}
                        />
                      )}
                      {shouldShowSetPrice && (
                        <ListSetPriceAction
                          dropId={dropId}
                          editionId={editionId}
                          curPrice={getValueByConfig(data, fieldConfig)}
                          refetch={refetch}
                        />
                      )}
                      {shouldShowClaimCodeButton && <ClaimCodeAction />}
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </Flex>
    </React.Fragment>
  );
};
