import React, { useMemo } from 'react';
import { Checkbox, Text } from 'src/theme';
import { ColumnDef } from '@tanstack/react-table';
import { SimpleDataTable } from 'src/general/datatable/SimpleDataTable';
import { EditionListingName } from './EditionListingName';
import { searchEditions_searchEditions_editions } from 'src/edge/__generated/types/admin/searchEditions';
import { searchDropEditions_searchDropEditions_dropEditions } from 'src/edge/__generated/types/consumer/searchDropEditions';
import {
  EditionImageType,
  EditionRarity,
  PlatformStatus,
} from 'src/edge/__generated/types/admin/globalTypes';
import { DropEdition } from '../drops/detail/DropEditionListing';
import { Status } from 'src/general/components/Status';
import { Creator } from 'src/general/components/Creator';

export interface Edition extends searchEditions_searchEditions_editions {
  status: PlatformStatus;
  image: string;
  editionFlowID: string;
}

export const formatEditionData = (
  editions:
    | searchEditions_searchEditions_editions[]
    | searchDropEditions_searchDropEditions_dropEditions[],
): Edition[] => {
  if (!editions) return [];
  return editions.map((edition) => {
    return {
      ...edition,
      status: edition.platformStatus || PlatformStatus.PUBLIC,
    };
  });
};

export const formatEditionDetailData = (editions) => {
  if (!editions) return [];
  return editions.map((edition) => {
    return {
      ...edition,
      metadata: {
        ...edition.metadata,
        rarity: EditionRarity[edition.metadata.rarity].substring(
          EditionRarity[edition.metadata.rarity].lastIndexOf('_') + 1,
        ),
      },
      flowID: edition.flowID > 0 ? edition.flowID : 'N/A', // draft edition's flowID is random generated neg number (not real flowID)
      price: '0', //Todo: update the price later
      createdOn: 'May 26, 2022', //Todo: update created date later once added
      status: edition.platformStatus || PlatformStatus.PUBLIC,
      waitingRoomID: 'N/A', //Todo: update waitingRoomID later once added
    };
  });
};

const EditionField = ({ content }: { content: string | number }) => (
  <Text fontSize="md" fontWeight="medium" fontFamily="Roobert Regular">
    {content}
  </Text>
);

interface Props {
  data: Edition[] | DropEdition[];
  loading: boolean;
  removeEditions?: (table) => void;
  isDropEdition?: boolean;
}

export const EditionListing = ({
  data,
  loading,
  removeEditions,
  isDropEdition,
}: Props) => {
  const columns = useMemo<ColumnDef<Edition | DropEdition>[]>(
    () => [
      {
        id: 'Edition',
        header: () => <Text fontSize="md">Edition</Text>,
        accessorKey: 'name',
        cell: (props) => {
          const edition = props.row.original;
          const containerImage = edition?.metadata?.images?.find(
            (e) => e.type === EditionImageType.EDITION_IMAGE_TYPE_CONTAINER,
          );

          return (
            <EditionListingName
              name={edition?.name}
              url={containerImage ? containerImage.url : null}
              flowID={edition?.flowID || 123}
              isDropEdition={isDropEdition}
              id={edition?.id || ''}
            />
          );
        },
      },
      {
        id: 'Size',
        header: () => <Text fontSize="md">Size</Text>,
        cell: (props) => {
          const edition = props.row.original;
          const size = edition?.size ? edition.size : 0;
          return <EditionField content={size} />;
        },
      },
      {
        id: 'Price',
        header: () => <Text fontSize="md">Price</Text>,
        cell: (props) => {
          const edition = props.row.original;
          // @ts-ignore
          const price = edition?.price || 0;
          return <EditionField content={price} />;
        },
      },
      {
        id: 'forSale',
        header: () => <Text fontSize="md">For Sale</Text>,
        cell: (props) => {
          const edition = props.row.original;
          let forSaleCount;
          if ('forSaleCount' in edition) {
            forSaleCount = edition.forSaleCount;
          } else {
            forSaleCount = edition?.salesStats?.numForSale || 0;
          }
          return <EditionField content={forSaleCount} />;
        },
      },
      {
        id: 'forClaim',
        header: () => <Text fontSize="md">For Claim</Text>,
        cell: (props) => {
          const edition = props.row.original;
          let forClaimCount;
          if ('forClaimCount' in edition) {
            forClaimCount = edition.forClaimCount;
          } else {
            forClaimCount = edition?.salesStats?.numForClaim || 0;
          }
          return <EditionField content={forClaimCount} />;
        },
      },
      {
        id: 'Creator',
        header: () => <Text fontSize="md">Creator</Text>,
        accessorKey: 'creator',
        cell: (props) => {
          const edition = props.row.original;
          return (
            <Creator
              creator={
                edition.creator.pref_username ?? edition.creator.owner_sub_id //@mountz-if pref_username is not set, default to cognito ID
              }
            />
          );
        },
      },
      {
        id: 'Status',
        header: () => <Text fontSize="md">Status</Text>,
        accessorKey: 'status',
        cell: (props) => {
          const edition = props.row.original;
          const status = edition?.platformStatus || PlatformStatus.PUBLIC;
          return <Status status={status} />;
        },
      },
    ],
    [],
  );

  if (!!removeEditions) {
    columns.splice(0, 0, {
      id: 'Select',
      header: () => '',
      cell: ({ row }) => {
        return (
          <Checkbox
            display={row.getIsSelected() ? 'inline' : 'none'}
            isChecked
            onChange={row.getToggleSelectedHandler()}
          />
        );
      },
    });
  }

  return (
    <SimpleDataTable
      columns={columns}
      loading={loading}
      data={data}
      removeEditions={removeEditions}
    />
  );
};
