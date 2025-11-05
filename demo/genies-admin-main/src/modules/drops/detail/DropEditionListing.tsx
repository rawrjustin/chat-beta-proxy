import React, { useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  useAdminClient,
  useConsumerClient,
} from 'src/lib/apollo/MultiApolloProvider';
import { Edition, EditionListing } from 'src/modules/Edition';
import { searchDropsWithEditionsQuery } from 'src/edge/gql/consumer/searchDropsQuery';
import { DropStatus } from 'src/edge/__generated/types/consumer/globalTypes';
import Logger from 'shared/logger';
import { v4 as uuidv4 } from 'uuid';
import { upsertDropMutation } from 'src/edge/gql/admin/upsertDropMutation';
import { PlatformStatus } from 'src/edge/__generated/types/admin/globalTypes';
import { useToast } from 'src/theme';

export interface DropEdition extends Edition {
  price?: number;
  forClaimCount?: number;
  forSaleCount?: number;
}

const formatedDropEdition = (dropEditions): DropEdition[] => {
  if (!dropEditions) return [];
  return dropEditions.map((dropEdition) => {
    return {
      price: dropEdition?.dropPrice || 0,
      forClaimCount: dropEdition?.remainingClaimCount || 0,
      forSaleCount: dropEdition?.remainingSaleCount || 0,
      status: dropEdition?.edition?.platformStatus || PlatformStatus.PUBLIC,
      ...dropEdition.edition,
    };
  });
};

export const DropEditionListing = ({ dropId }: { dropId: string }) => {
  const consumerClient = useConsumerClient();
  const adminClient = useAdminClient();
  const toast = useToast();
  const [upsertDrop] = useMutation(upsertDropMutation, {
    client: adminClient,
  });
  const { loading, data, error, refetch } = useQuery(
    searchDropsWithEditionsQuery,
    {
      variables: {
        searchInput: {
          filters: {
            byID: [dropId],
            notIDs: [],
            byDropStatuses: [DropStatus.ALL],
          },
        },
      },
      client: consumerClient,
    },
  );
  const defaultData = useMemo<DropEdition[]>(() => [], []);
  const formateddata = data
    ? formatedDropEdition(data?.searchDrops?.drops[0]?.dropEditions)
    : defaultData;

  if (error) {
    toast({
      title: 'searchDropsWithEditionsQuery Error',
      description: `searchDropsWithEditionsQueryerror:  ${error?.message}`,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
    Logger.getInstance().error(
      `searchDropsWithEditionsQuery error: ${error.message}`,
      {
        errorMessage: error.message,
        dropId,
        source: 'DropEditionListing',
      },
    );
  }

  // currently disabling editing drops since upsertDrops does not support removing editions
  // pass removeEditions to EditionListing to enable
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeEditions = async (table) => {
    const removeEditions = table.getSelectedRowModel().rows.map((edition) => {
      return edition.original.id;
    });

    const upsertEditionIds = data?.searchDrops?.drops[0].dropEditions
      .filter((dropEdition) => !removeEditions.includes(dropEdition.editionId))
      .map((dropEdition) => {
        const dropPrice = dropEdition.dropPrice;
        const editionID = dropEdition.editionId;
        return { dropPrice, editionID };
      });

    let payload = {
      variables: {
        input: {
          id: dropId,
          dropEditionPrices: [...upsertEditionIds],
          idempotencyKey: uuidv4(),
        },
      },
    };

    const { errors: upsertDropErrors } = await upsertDrop(payload);
    if (upsertDropErrors) {
      throw new Error(upsertDropErrors[0].message);
    } else {
      //refetch searchDrops query after updating data
      refetch();
    }
  };

  return (
    <EditionListing
      data={formateddata}
      loading={loading}
      isDropEdition={true}
    />
  );
};
