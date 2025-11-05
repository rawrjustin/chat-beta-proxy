import { PlatformStatus } from 'src/edge/__generated/types/admin/globalTypes';
import { searchDrops_searchDrops_drops } from 'src/edge/__generated/types/consumer/searchDrops';

export enum DropReleaseType {
  Collection = 'Collection',
  AirDrop = 'AirDrop',
}

export interface Drop extends searchDrops_searchDrops_drops {
  type: string;
  status: string;
}

export const formatDropData = (Drops): Drop[] => {
  if (!Drops) return [];
  return Drops.map((drop) => {
    return {
      ...drop,
      type: DropReleaseType.Collection, // Todo: update the type information later
      status: PlatformStatus.PUBLIC,
    };
  });
};
