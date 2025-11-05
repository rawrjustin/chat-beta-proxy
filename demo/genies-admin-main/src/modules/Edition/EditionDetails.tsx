import React, { useEffect } from 'react';
import { InfoTable } from 'src/general/infotable/InfoTable';
import { FieldConfig } from 'src/modules/collections/details/CollectionDetailForm';
import { Image } from 'src/theme';
import { useConsumerClient } from 'src/lib/apollo/MultiApolloProvider';
import { useQuery } from '@apollo/client';
import { searchEditionDetailsQuery } from 'src/edge/gql/consumer/searchEditionsQuery';
import { formatEditionDetailData } from 'src/modules/Edition/EditionListing';
import Logger from 'shared/logger';
import { Status } from 'src/general/components/Status';
import { EditionImageType } from 'src/edge/__generated/types/admin/globalTypes';
import { searchDropEditionsQuery } from 'src/edge/gql/consumer/searchDropEditionsQuery';
import { Link, Text } from 'src/theme';
import { collectionsDetail, dropsDetail } from '../routes';
import { searchDropTitleQuery } from 'src/edge/gql/consumer/searchDropsQuery';
import { useConfig, DynamicConfig } from 'src/lib/statsig';

export const detailsFormConfig: FieldConfig[] = [
  { label: 'Name', key: 'name', isEditable: false, isOnchain: true },
  { label: 'Price', key: 'dropPrice', isEditable: true, isOnchain: false },
  {
    label: 'Rarity',
    key: ['metadata', 'rarity'],
    isEditable: false,
    isOnchain: true,
  },
  { label: 'Edition Size', key: 'size', isEditable: true, isOnchain: false },
  {
    label: 'Remaining For Sale',
    key: ['saleCount'],
    isEditable: true,
    isOnchain: false,
  },
  {
    label: 'Remaining For Claim',
    key: ['claimCount'],
    isEditable: true,
    isOnchain: false,
  },
  {
    label: 'Claim Code',
    key: ['claimCode'],
    isEditable: false,
    isOnchain: false,
    render: (v) => {
      return v ? (
        <Link
          href={`${process.env.NEXT_PUBLIC_WAREHOUSE_SITE_URL}/collection/wearables/${v.dropEditionID}?code=${v.code}`}
          isExternal
          rel="noopener noreferrer"
        >
          {v.code}
        </Link>
      ) : (
        <Text>NULL</Text>
      );
    },
  },
  {
    label: 'Edition Flow ID',
    key: 'flowID',
    isEditable: false,
    isOnchain: true,
  },
  { label: 'Edition ID', key: 'id', isEditable: false, isOnchain: false },
  {
    label: 'Collection',
    key: 'collection',
    isEditable: false,
    isOnchain: true,
    render: (v) => {
      return (
        <Link display="inline" color="white" href={collectionsDetail(v.id)}>
          {v.name}
        </Link>
      );
    },
  },
  {
    label: 'Drop',
    key: 'drop',
    isEditable: false,
    isOnchain: false,
    render: (v) => {
      return v?.id ? (
        <Link display="inline" color="white" href={dropsDetail(v.id)}>
          {v?.title || v?.id}
        </Link>
      ) : (
        <Text w="full" textStyle="userDetailFont" color="gray.600">
          N/A
        </Text>
      );
    },
  },
  {
    label: 'Creator',
    key: ['creator', 'id'],
    isEditable: true,
    isOnchain: false,
  },
  {
    label: 'Created On',
    key: 'createdOn',
    isEditable: false,
    isOnchain: false,
  },
  {
    label: 'Status',
    key: 'status',
    isEditable: false,
    isOnchain: false,
    render: (v: string) => {
      return <Status status={v} />;
    },
  },
  {
    label: 'Waiting Room ID',
    key: 'waitingRoomID',
    isEditable: true,
    isOnchain: false,
  },
];

// // Todo: Mock data mutation function, we need to update the field after migrating the CMS function
// const mockUpdateData = (
//   id: string,
//   field: string | string[],
//   newData: string | object,
// ) => {};

const formatEditionDetailsData = (
  edition,
  dropEdition,
  drop,
  codeEditionFlowIds,
) => {
  const claimCount = edition?.dropEditionID
    ? dropEdition?.remainingClaimCount
    : edition?.salesStats?.numForClaim;
  const saleCount = edition?.dropEditionID
    ? dropEdition?.remainingSaleCount
    : edition?.salesStats?.numForSale;
  let claimCode = null;
  Object.keys(codeEditionFlowIds).forEach((key) => {
    if (codeEditionFlowIds[key].includes(edition?.flowID)) {
      claimCode = {
        code: key,
        dropEditionID: edition?.dropEditionID,
      };
    }
  });
  return {
    ...edition,
    dropPrice: dropEdition?.dropPrice || 0,
    claimCount: claimCount || 0,
    saleCount: saleCount || 0,
    claimCode,
    drop,
  };
};

export const EditionDetails = ({
  flowId,
  setDropEditionID,
  setDropEditionTitle,
}: {
  flowId: string;
  setDropEditionID;
  setDropEditionTitle?;
}) => {
  const consumerClient = useConsumerClient();
  const {
    data: rowData,
    loading,
    error,
  } = useQuery(searchEditionDetailsQuery, {
    variables: {
      searchInput: {
        filters: {
          byFlowIDs: [flowId],
        },
        isSaleStatsRequired: true,
        base: {
          pagination: {
            cursor: '',
            direction: 'RIGHT',
            limit: 50,
          },
        },
      },
    },
    client: consumerClient,
    skip: !flowId,
  });
  const claimCodeConfig = useConfig(DynamicConfig.CLAIM_CODE);
  const codeEditionFlowIds =
    claimCodeConfig?.config?.value?.code_editionFlowIds;

  const data = rowData
    ? formatEditionDetailData(rowData.searchEditions.editions)[0]
    : null;

  if (error) {
    Logger.getInstance().error(
      `searchEditionDetailsQuery filterd by flowId error: ${error.message}`,
      {
        errorMessage: error.message,
        flowId,
        source: 'EditionDetails',
      },
    );
  }

  const dropEditionId = data?.dropEditionID;
  const dropEditionTitle = data?.name;

  useEffect(
    () => setDropEditionID(dropEditionId),
    [dropEditionId, setDropEditionID],
  );

  useEffect(
    () => setDropEditionTitle && setDropEditionTitle(dropEditionTitle),
    [dropEditionTitle, setDropEditionTitle],
  );

  const {
    data: dropEditionData,
    loading: dropEditionLoading,
    error: dropEditionError,
    refetch,
  } = useQuery(searchDropEditionsQuery, {
    variables: {
      searchInput: {
        filters: {
          byID: [dropEditionId],
          byCollectionID: [],
        },
      },
    },
    client: consumerClient,
    skip: !dropEditionId,
  });

  if (dropEditionError) {
    Logger.getInstance().error(
      `searchDropEditionsQuery filterd by dropEditionId error: ${dropEditionError.message}`,
      {
        errorMessage: dropEditionError.message,
        dropEditionId,
        source: 'EditionDetails',
      },
    );
  }

  const EditionImage = !loading && (
    <Image
      mt={10}
      mb={10}
      src={
        data?.metadata?.images?.find(
          (e) => e.type === EditionImageType.EDITION_IMAGE_TYPE_CONTAINER,
        ).url
      }
      alt="Edition Picture"
      width={['200px', '287px']}
    />
  );

  const dropId = dropEditionData?.searchDropEditions?.dropEditions?.[0].dropId;

  const { data: dropData, error: dropDataError } = useQuery(
    searchDropTitleQuery,
    {
      variables: {
        searchInput: {
          filters: {
            byID: [dropId],
            notIDs: [],
            byDropStatuses: [],
          },
        },
      },
      client: consumerClient,
      skip: !dropId,
    },
  );

  if (dropDataError) {
    Logger.getInstance().error(
      `searchDropTitleQuery filterd by dropId error: ${dropDataError.message}`,
      {
        errorMessage: dropDataError.message,
        dropId,
        source: 'EditionDetails',
      },
    );
  }

  const formattedData =
    !loading && !dropEditionLoading && data
      ? formatEditionDetailsData(
          data,
          dropEditionData?.searchDropEditions?.dropEditions?.[0],
          dropData?.searchDrops?.drops[0],
          codeEditionFlowIds,
        )
      : null;

  const selectedEditionId = data?.id;
  //@mountz TODO-remove setMockData prop from InfoTable after user details context is done

  return (
    <InfoTable
      formConfig={detailsFormConfig}
      data={formattedData}
      loading={!flowId || loading || dropEditionLoading}
      updateData={() => {}}
      image={EditionImage}
      editionId={selectedEditionId}
      dropId={dropId}
      refetch={refetch}
    />
  );
};
