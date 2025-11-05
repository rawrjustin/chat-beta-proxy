import namor from 'namor';
import { useState, useEffect } from 'react';
import { Collection } from './CollectionType';

const newCollection = (idx: number): Collection => {
  const statusChance = Math.random();
  return {
    __typename: 'Collection',
    id: idx.toString(),
    name: idx + '-' + namor.generate({ words: 1, saltLength: 2 }),
    open: false,
    editionsActive: 0,
    metadata: {
      __typename: 'CollectionMetadata',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat.',
    },
    series: {
      __typename: 'Series',
      id: '00000000-0000',
      flowID: idx,
      name: idx + '-' + namor.generate({ words: 1, saltLength: 2 }),
    },
    platformStatus: 'PUBLIC',
    flowID: idx,
    creatorID: '00000000-0000-0000-0000-000000000000',
    creator: idx + '-' + namor.generate({ words: 1, saltLength: 2 }),
    status:
      statusChance > 0.66
        ? 'PUBLIC'
        : statusChance > 0.33
        ? 'ON_SALE'
        : 'DRAFT',
    createdOn: 'May 26, 2022',
  };
};

const generateCollectionDetail = (idx: number): Collection => {
  return {
    __typename: 'Collection',
    id: idx.toString(),
    name: 'Black Diamond',
    open: false,
    editionsActive: 0,
    metadata: {
      __typename: 'CollectionMetadata',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat.',
    },
    series: {
      __typename: 'Series',
      id: '00000000-0000',
      flowID: 11,
      name: 'Original Series',
    },
    platformStatus: 'PUBLIC',
    flowID: 56,
    creatorID: '00000000-0000-0000-0000-000000000000',
    creator: 'fakeCreator',
    status: 'PUBLIC',
    createdOn: 'May 26, 2022',
  };
};

const generateCollectionData = (len: number) => {
  const collectionArray: Array<Collection> = [];
  for (let i = 0; i < len; i++) {
    collectionArray.push(newCollection(i));
  }
  return collectionArray;
};

const _count = 228;
let _collectonList: Array<Collection> = generateCollectionData(_count);

export const getCollection = (idx: number, limit: number) => {
  if (_collectonList.length === 0) _collectonList = generateCollectionData(500);
  return _collectonList.slice(idx, idx + limit);
};

export const useMockData = (idx: number, limit: number) => {
  const [data, setData] = useState<Collection[] | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData(_collectonList.slice(idx * limit, idx * limit + limit));
      setLoading(false);
    }, 1000);
  }, [idx, limit]);
  return {
    loading,
    data: data
      ? {
          collections: data,
          count: _count,
        }
      : null,
  };
};

let _collectionDetail: Collection;

export const useMockCollectionDetail = (idx: number) => {
  const [data, setData] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!_collectionDetail) _collectionDetail = generateCollectionDetail(idx);
    setLoading(true);
    setTimeout(() => {
      setData(_collectionDetail);
      setLoading(false);
    }, 1000);
  }, [idx, _collectionDetail]);
  return { loading, data };
};

export const updateData = (idx: number, field: string, newData: any) => {
  _collectionDetail = {
    ..._collectionDetail,
    [field]: newData,
  };
};
