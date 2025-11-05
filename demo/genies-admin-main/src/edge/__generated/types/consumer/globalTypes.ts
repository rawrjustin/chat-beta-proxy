/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum CursorDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum DropSortType {
  CREATED_AT_ASC = 'CREATED_AT_ASC',
  CREATED_AT_DESC = 'CREATED_AT_DESC',
  START_TIME_ASC = 'START_TIME_ASC',
  START_TIME_DESC = 'START_TIME_DESC',
}

export enum DropStatus {
  ALL = 'ALL',
  CURRENT = 'CURRENT',
  FEATURED = 'FEATURED',
  RETIRED = 'RETIRED',
  UPCOMING = 'UPCOMING',
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

export enum ExperienceBuildStatus {
  ALL = 'ALL',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  UNDERREVIEW = 'UNDERREVIEW',
}

export enum ExperienceSortType {
  CREATED_AT_ASC = 'CREATED_AT_ASC',
  CREATED_AT_DESC = 'CREATED_AT_DESC',
  UPDATED_AT_ASC = 'UPDATED_AT_ASC',
  UPDATED_AT_DESC = 'UPDATED_AT_DESC',
}

export enum ExperienceStatus {
  ALL = 'ALL',
  LISTED = 'LISTED',
  UNLISTED = 'UNLISTED',
}

export enum PlatformStatus {
  ALL = 'ALL',
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum SaleStatus {
  ALL = 'ALL',
  CREATED = 'CREATED',
  FOR_SALE = 'FOR_SALE',
  SOLD_OUT = 'SOLD_OUT',
}

export interface BaseSearchInput {
  pagination: PaginationInput;
}

export interface DropEditionFilters {
  byCollectionID?: (string | null)[] | null;
  byID?: (string | null)[] | null;
}

export interface DropFilters {
  byID?: (string | null)[] | null;
  notIDs?: string[] | null;
  byCreatorID?: string | null;
  byDropStatuses?: DropStatus[] | null;
  byPlatformStatuses?: PlatformStatus[] | null;
}

export interface ExperienceBuildsFilters {
  byIDs?: (string | null)[] | null;
  byExperienceID?: string | null;
  byBuildStatus?: ExperienceBuildStatus | null;
  byStoredInS3?: boolean | null;
}

export interface ExperienceFilters {
  byOwnerIDs?: (string | null)[] | null;
  byExperienceIDs?: (string | null)[] | null;
  byStatuses?: (ExperienceBuildStatus | null)[] | null;
  withBuilds?: boolean | null;
  byExperienceStatus?: ExperienceStatus | null;
}

export interface GetUserProfile {
  sub?: string | null;
  prefUsername?: string | null;
}

export interface PaginationInput {
  cursor: any;
  direction: CursorDirection;
  limit: number;
}

export interface SearchDropEditionsInput {
  filters?: DropEditionFilters | null;
}

export interface SearchDropsInput {
  filters?: DropFilters | null;
  pageSize?: number | null;
  cursor?: any | null;
  sortBy?: DropSortType | null;
}

export interface SearchEditionsFilters {
  byFlowIDs?: number[] | null;
  byCreatorID?: string | null;
  bySaleStatus?: SaleStatus | null;
}

export interface SearchEditionsInput {
  base: BaseSearchInput;
  filters?: SearchEditionsFilters | null;
  isSaleStatsRequired?: boolean | null;
}

export interface SearchExperienceBuildsInput {
  base: BaseSearchInput;
  filters?: ExperienceBuildsFilters | null;
}

export interface SearchExperiencesInput {
  base: BaseSearchInput;
  filters?: ExperienceFilters | null;
  sortBy?: ExperienceSortType | null;
}

export interface UpsertExperienceBuildInput {
  id?: string | null;
  status?: string | null;
  description?: string | null;
  experienceClientId?: string | null;
  fileName?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
