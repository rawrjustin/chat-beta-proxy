/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getAllCollection
// ====================================================

export interface getAllCollection_getAllCollections_collections {
  __typename: 'Collection';
  id: string;
  name: string;
}

export interface getAllCollection_getAllCollections {
  __typename: 'GetAllCollectionsResponse';
  collections: (getAllCollection_getAllCollections_collections | null)[] | null;
}

export interface getAllCollection {
  getAllCollections: getAllCollection_getAllCollections | null;
}
