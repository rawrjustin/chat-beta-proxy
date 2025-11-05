/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum AirdropType {
  ASSIGN = 'ASSIGN',
  OWNERSHIPLESS = 'OWNERSHIPLESS',
}

export enum CollectionImageType {
  ENVIRONMENT = 'ENVIRONMENT',
  NIL = 'NIL',
}

export enum CursorDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum EditionDesignSlot {
  EDITION_DESIGN_SLOT_BRACELET = 'EDITION_DESIGN_SLOT_BRACELET',
  EDITION_DESIGN_SLOT_DRESS = 'EDITION_DESIGN_SLOT_DRESS',
  EDITION_DESIGN_SLOT_EARRINGS = 'EDITION_DESIGN_SLOT_EARRINGS',
  EDITION_DESIGN_SLOT_GLASSES = 'EDITION_DESIGN_SLOT_GLASSES',
  EDITION_DESIGN_SLOT_HAT = 'EDITION_DESIGN_SLOT_HAT',
  EDITION_DESIGN_SLOT_HELMET = 'EDITION_DESIGN_SLOT_HELMET',
  EDITION_DESIGN_SLOT_HOODIE = 'EDITION_DESIGN_SLOT_HOODIE',
  EDITION_DESIGN_SLOT_JACKET = 'EDITION_DESIGN_SLOT_JACKET',
  EDITION_DESIGN_SLOT_MASK = 'EDITION_DESIGN_SLOT_MASK',
  EDITION_DESIGN_SLOT_NECKLACE = 'EDITION_DESIGN_SLOT_NECKLACE',
  EDITION_DESIGN_SLOT_NIL = 'EDITION_DESIGN_SLOT_NIL',
  EDITION_DESIGN_SLOT_PANTS = 'EDITION_DESIGN_SLOT_PANTS',
  EDITION_DESIGN_SLOT_RING = 'EDITION_DESIGN_SLOT_RING',
  EDITION_DESIGN_SLOT_SANDALS = 'EDITION_DESIGN_SLOT_SANDALS',
  EDITION_DESIGN_SLOT_SHIRT = 'EDITION_DESIGN_SLOT_SHIRT',
  EDITION_DESIGN_SLOT_SHOES = 'EDITION_DESIGN_SLOT_SHOES',
  EDITION_DESIGN_SLOT_SHORTS = 'EDITION_DESIGN_SLOT_SHORTS',
  EDITION_DESIGN_SLOT_SKIRT = 'EDITION_DESIGN_SLOT_SKIRT',
  EDITION_DESIGN_SLOT_WATCH = 'EDITION_DESIGN_SLOT_WATCH',
}

export enum EditionImageType {
  EDITION_IMAGE_TYPE_CONTAINER = 'EDITION_IMAGE_TYPE_CONTAINER',
  EDITION_IMAGE_TYPE_HERO = 'EDITION_IMAGE_TYPE_HERO',
  EDITION_IMAGE_TYPE_MANNEQUIN_FULL = 'EDITION_IMAGE_TYPE_MANNEQUIN_FULL',
  EDITION_IMAGE_TYPE_MANNEQUIN_ZOOM = 'EDITION_IMAGE_TYPE_MANNEQUIN_ZOOM',
  EDITION_IMAGE_TYPE_NIL = 'EDITION_IMAGE_TYPE_NIL',
  EDITION_IMAGE_TYPE_WEARABLE = 'EDITION_IMAGE_TYPE_WEARABLE',
}

export enum EditionRarity {
  EDITION_RARITY_COMMON = 'EDITION_RARITY_COMMON',
  EDITION_RARITY_EPIC = 'EDITION_RARITY_EPIC',
  EDITION_RARITY_LEGENDARY = 'EDITION_RARITY_LEGENDARY',
  EDITION_RARITY_NIL = 'EDITION_RARITY_NIL',
  EDITION_RARITY_RARE = 'EDITION_RARITY_RARE',
  EDITION_RARITY_STANDARD = 'EDITION_RARITY_STANDARD',
  EDITION_RARITY_UNIQUE = 'EDITION_RARITY_UNIQUE',
}

export enum EditionType {
  EDITION_TYPE_AVATAR_NIL = 'EDITION_TYPE_AVATAR_NIL',
  EDITION_TYPE_AVATAR_STATUE = 'EDITION_TYPE_AVATAR_STATUE',
  EDITION_TYPE_AVATAR_WEARABLE = 'EDITION_TYPE_AVATAR_WEARABLE',
}

export enum EditionVideoType {
  EDITION_VIDEO_TYPE_NIL = 'EDITION_VIDEO_TYPE_NIL',
  EDITION_VIDEO_TYPE_UNBOXING = 'EDITION_VIDEO_TYPE_UNBOXING',
}

export enum NFTSortType {
  CREATED_AT_ASC = 'CREATED_AT_ASC',
  CREATED_AT_DESC = 'CREATED_AT_DESC',
  UPDATED_AT_ASC = 'UPDATED_AT_ASC',
  UPDATED_AT_DESC = 'UPDATED_AT_DESC',
}

export enum NFTStatus {
  ACTIVE = 'ACTIVE',
  ALL = 'ALL',
  AVAILABLE_TO_LIST = 'AVAILABLE_TO_LIST',
  BURNED = 'BURNED',
}

export enum PlatformStatus {
  DRAFT = 'DRAFT',
  ON_SALE = 'ON_SALE',
  PUBLIC = 'PUBLIC',
}

export interface AddCollectionInput {
  name: string;
  seriesFlowID: number;
  collectionID?: string | null;
  description?: string | null;
}

export interface AddEditionInput {
  name: string;
  collectionFlowID: number;
  onchainMetadata: EditionOnchainMetadata;
  editionID?: string | null;
  async?: boolean | null;
}

export interface AdminSearchCollectionsInput {
  filters?: CollectionFilters | null;
  pageSize: number;
  cursor?: any | null;
}

export interface BaseSearchInput {
  pagination: PaginationInput;
}

export interface CloseCollectionInput {
  flowID: number;
  idempotencyKey: string;
  collectionID: string;
}

export interface CollectionFilters {
  byFlowIDs?: number[] | null;
  byCreatorIDs?: string[] | null;
  byCollectionIDs?: string[] | null;
}

export interface CollectionImageInput {
  type: CollectionImageType;
  url: string;
}

export interface CollectionMetadataInput {
  description?: string | null;
  images?: (CollectionImageInput | null)[] | null;
}

export interface CreateAirdropInput {
  flowAddresses?: string[] | null;
  nftFlowIDs: number[];
  idempotencyKey: string;
  airdropType: AirdropType;
}

export interface DeleteReservedUsernamesInput {
  username: string;
}

export interface DropEditionPrice {
  dropPrice: any;
  editionID: string;
}

export interface EditionFilters {
  byFlowIDs?: (number | null)[] | null;
  byCollectionFlowIDs?: number[] | null;
  byDropIDs?: string[] | null;
  byCreatorID?: string | null;
  byPlatformStatus?: PlatformStatus | null;
  byIDs?: string[] | null;
}

export interface EditionImageInput {
  type: EditionImageType;
  url: string;
}

export interface EditionOffchainMetadata {
  description?: string | null;
  images?: (EditionImageInput | null)[] | null;
  videos?: (EditionVideoInput | null)[] | null;
  genres?: (string | null)[] | null;
  retired?: boolean | null;
  platformStatus?: string | null;
}

export interface EditionOnchainMetadata {
  rarity?: EditionRarity | null;
  celebrity?: string | null;
  artist?: string | null;
  type?: EditionType | null;
  designSlot?: EditionDesignSlot | null;
  publisher?: string | null;
  trademark?: string | null;
  avatarWearableSKU?: string | null;
  assetID?: string | null;
}

export interface EditionVideoInput {
  type: EditionVideoType;
  url: any;
  videoLength: number;
}

export interface MintNFTOrderInput {
  editionFlowID: number;
  quantity: number;
}

export interface MintNFTsInput {
  orders: (MintNFTOrderInput | null)[];
  flowReceiverAddress: string;
  idempotencyKey: string;
  async?: boolean | null;
}

export interface NFTFilters {
  byCollectionIDs?: (string | null)[] | null;
  byFlowIDs?: (number | null)[] | null;
  byOwnerFlowAddress?: (string | null)[] | null;
  byEditionFlowIDs?: (number | null)[] | null;
  byNFTStatus?: NFTStatus | null;
}

export interface PaginationInput {
  cursor: any;
  direction: CursorDirection;
  limit: number;
}

export interface ReservedUsernamesFilter {
  byUsernames?: string[] | null;
  byPhoneNumber?: string | null;
}

export interface RetireEditionInput {
  flowID: number;
  idempotencyKey: string;
  editionID: string;
}

export interface SearchEditionsInput {
  filters: EditionFilters;
  isSaleStatsRequired?: boolean | null;
}

export interface SearchNFTsInput {
  base: BaseSearchInput;
  sortBy?: NFTSortType | null;
  filters?: NFTFilters | null;
}

export interface SearchReservedUsernamesInput {
  filters: ReservedUsernamesFilter;
  pageSize: number;
  cursor?: any | null;
}

export interface SearchUserProfileInput {
  flowAddress?: string | null;
  sub?: string | null;
  phoneNumber?: string | null;
  prefUsername?: string | null;
}

export interface SellItemsInput {
  nftName: string;
  nftStorageName: string;
  nftFlowIDs: (number | null)[];
  ftName: string;
  ftStorageName: string;
  price: number;
  idempotencyKey: string;
}

export interface SoftDeleteExperienceInput {
  id: string;
}

export interface UpdateCollectionInput {
  id: string;
  metadata?: CollectionMetadataInput | null;
  idempotencyKey: string;
}

export interface UpdateEditionInput {
  editionID: string;
  offchainMetadata: EditionOffchainMetadata;
  idempotencyKey: string;
}

export interface UpsertCollectionInput {
  name?: string | null;
  seriesFlowID?: number | null;
  collectionID?: string | null;
  description?: string | null;
}

export interface UpsertDropInput {
  id?: string | null;
  creatorID?: string | null;
  title?: string | null;
  description?: string | null;
  imageURL?: string | null;
  dropEditionPrices?: (DropEditionPrice | null)[] | null;
  startTime?: any | null;
  endTime?: any | null;
  purchaseLimit?: number | null;
  idempotencyKey: string;
  publishedAt?: any | null;
}

export interface UpsertEditionInput {
  name: string;
  collectionFlowID: number;
  onchainMetadata?: EditionOnchainMetadata | null;
  editionID?: string | null;
}

export interface UpsertReservedUsernameInput {
  username: string;
  phoneNumber?: string | null;
}

export interface UpsertReservedUsernamesInput {
  upsertReservedUsernames?: UpsertReservedUsernameInput[] | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
