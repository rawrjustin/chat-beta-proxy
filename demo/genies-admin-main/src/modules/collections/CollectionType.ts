import { PlatformStatus } from 'src/edge/__generated/types/admin/globalTypes';
import { searchCollections_searchCollections_collections } from 'src/edge/__generated/types/admin/searchCollections';

export interface Collection
  extends searchCollections_searchCollections_collections {
  creator: string;
  createdOn: string;
  status: string;
}

export const formatCollectionData = (collections): Collection[] => {
  return collections
    .filter((collection) => collection.open)
    .map((collection) => {
      return {
        ...collection,
        creator: 'Genies', // Todo: update the creator information later
        createdOn: 'May 26, 2022', // Todo: update the created date later
        status: collection.platformStatus || PlatformStatus.PUBLIC,
      };
    });
};
