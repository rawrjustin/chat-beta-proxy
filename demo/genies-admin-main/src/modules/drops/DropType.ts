import { PlatformStatus } from 'src/edge/__generated/types/admin/globalTypes';
import { searchDrops_searchDrops_drops } from 'src/edge/__generated/types/consumer/searchDrops';

export interface Drop extends searchDrops_searchDrops_drops {
  status: string;
}

export const formatDropData = (drops): Drop[] => {
  if (!drops) return [];
  return drops.map((drop) => {
    return {
      ...drop,
      status: PlatformStatus.PUBLIC,
    };
  });
};
