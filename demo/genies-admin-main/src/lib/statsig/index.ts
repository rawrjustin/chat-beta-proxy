import { useConfig } from 'statsig-react';
export { useConfig, useGate } from 'statsig-react';

export enum DynamicConfig {
  ADMIN_WHITELIST = 'admin_whitelist',
  ADMIN_FEATURE_FLAGS = 'admin_feature_flags',
  CLAIM_CODE = 'claim_code',
}

/**
 * The is the list of key for the ADMIN_FEATURE_FLAGS DynamicConfig
 */
export enum AdminFeatureFlags {
  ENABLE_SEARCH_BAR = 'enableSearchBar',
  ENABLE_USER_MENU = 'enableUserMenu',
  ENABLE_EXPORT_ACTION = 'enableExportAction',
  ENABLE_TABLE_ROW_SELECTION = 'enableTableRowSelection',
  ENABLE_CREATE_DROP = 'enableCreateDrop',
  ENABLE_UPLOAD_IMAGE_BUTTON = 'enableUploadImageButton',
  ENABLE_OTP_SECOND_REQUEST = 'enableOtpSecondRequest',
  ENABLE_CREATE_COLLECTION = 'enableCreateCollection',
  ENABLE_CREATE_EDITION = 'enableCreateEdition',
}

export const useGetFeatureFlags = (flag: AdminFeatureFlags) => {
  const adminFeatureFlags = useConfig(DynamicConfig.ADMIN_FEATURE_FLAGS);
  return adminFeatureFlags.config.getValue()?.[flag];
};
