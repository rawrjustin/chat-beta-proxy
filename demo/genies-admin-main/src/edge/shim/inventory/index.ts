import getUserInventory from './getUserInventory';
import createMetadataStore from './createMetadataStore';
import getMetadataTag from './getMetadataTag';
import setMetadataTag from './setMetadataTag';
import createAssetSupply from './createAssetSupply';
import getMetadataStore from './getMetadataStore';
import mintAsset from './mintAsset';
import burnAssetInstance from './burnAssetInstance';
import deleteAssets from './deleteAssets';
// V2 Inventory Functions (Real endpoints)
import getInventoryV2AnimationLibrary from './getInventoryV2AnimationLibrary';
import getInventoryV2AvatarBase from './getInventoryV2AvatarBase';
import getInventoryV2AvatarEyes from './getInventoryV2AvatarEyes';
import getInventoryV2AvatarFlair from './getInventoryV2AvatarFlair';
import getInventoryV2AvatarMakeup from './getInventoryV2AvatarMakeup';
import getInventoryV2ColorPresets from './getInventoryV2ColorPresets';
import getInventoryV2Gear from './getInventoryV2Gear';
import getInventoryV2ImageLibrary from './getInventoryV2ImageLibrary';
import getInventoryV2ModelLibrary from './getInventoryV2ModelLibrary';
// Default Items Functions
import getDefaultGear from './getDefaultGear';
import getDefaultDecor from './getDefaultDecor';
import getDefaultAvatar from './getDefaultAvatar';
import getDefaultAvatarBase from './getDefaultAvatarBase';
import getDefaultAvatarMakeup from './getDefaultAvatarMakeup';
import getDefaultAvatarFlair from './getDefaultAvatarFlair';
import getDefaultAvatarEyes from './getDefaultAvatarEyes';
import getDefaultColorPresets from './getDefaultColorPresets';
import getDefaultImageLibrary from './getDefaultImageLibrary';
import getDefaultAnimationLibrary from './getDefaultAnimationLibrary';
import getDefaultModelLibrary from './getDefaultModelLibrary';
// Metadata Store Manager Functions
import getAllMetadataStores from './getAllMetadataStores';
import createDefaultClosetNamespace from './createDefaultClosetNamespace';
import createDefaultItem from './createDefaultItem';
import updateMetadataTag from './updateMetadataTag';

export {
  // V1 Inventory Functions
  getUserInventory,
  createMetadataStore,
  getMetadataTag,
  setMetadataTag,
  createAssetSupply,
  getMetadataStore,
  mintAsset,
  burnAssetInstance,
  deleteAssets,
  // V2 Inventory Functions (Real endpoints)
  getInventoryV2AnimationLibrary,
  getInventoryV2AvatarBase,
  getInventoryV2AvatarEyes,
  getInventoryV2AvatarFlair,
  getInventoryV2AvatarMakeup,
  getInventoryV2ColorPresets,
  getInventoryV2Gear,
  getInventoryV2ImageLibrary,
  getInventoryV2ModelLibrary,
  // Default Items Functions
  getDefaultGear,
  getDefaultDecor,
  getDefaultAvatar,
  getDefaultAvatarBase,
  getDefaultAvatarMakeup,
  getDefaultAvatarFlair,
  getDefaultAvatarEyes,
  getDefaultColorPresets,
  getDefaultImageLibrary,
  getDefaultAnimationLibrary,
  getDefaultModelLibrary,
  // Metadata Store Manager Functions
  getAllMetadataStores,
  createDefaultClosetNamespace,
  createDefaultItem,
  updateMetadataTag,
};
