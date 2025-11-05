import type { NextApiRequest, NextApiResponse } from 'next';
import { EndpointName } from 'src/edge/shim/callShimAdmin';
import axios from 'axios';
import Logger from 'shared/logger';
import { ACCESS_TOKEN_KEY } from 'src/lib/auth';
import * as cookie from 'cookie';

const consumerEndpoints: Array<string> = [
  EndpointName.GET_GEAR_LIST_ADMIN,
  EndpointName.GET_THINGS_ADMIN,
  EndpointName.DELETE_THINGS_ADMIN,
  EndpointName.GET_USER_TRAIT_PROFILE,
  EndpointName.GET_TRAITS,
  EndpointName.RESET_TRAIT_PROFILE,
  EndpointName.SET_TRAIT_SOCRE,
  EndpointName.GET_TRAIT_PROGRESS,
  EndpointName.FORCE_ADD_HARD_CURRENCY,
  EndpointName.GET_TRANSACTION_HISTORY,
  EndpointName.GET_HARD_CURRENCY_PRODUCTS,
  EndpointName.UPDATE_HARD_CURRENCY_PRODUCT,
  EndpointName.ADD_HARD_CURRENCY_PRODUCT,
  EndpointName.UPSERT_HC_PRODUCT_SKU_MAPPING,
  EndpointName.UPSERT_HC_PRODUCT_METADATA,
  EndpointName.GET_ALL_HC_PRODUCT_METADATA,
  EndpointName.GET_ALL_SOFT_CURRENCY_PRODUCTS,
  EndpointName.UPDATE_SOFT_CURRENCY_PRODUCT,
  EndpointName.ADD_SOFT_CURRENCY_PRODUCT,
  EndpointName.DELETE_SOFT_CURRENCY_PRODUCT,
  EndpointName.GET_ALL_CURRENCIES_FOR_OWNER,
  EndpointName.UPSERT_SOFT_CURRENCY,
  EndpointName.DELETE_SOFT_CURRENCY,
  EndpointName.GET_ADMIN_USER_INVENTORY,
  EndpointName.CREATE_METADATA_STORE,
  EndpointName.GET_METADATA_TAG,
  EndpointName.SET_METADATA_TAG,
  EndpointName.CREATE_ASSET_SUPPLY,
  EndpointName.GET_METADATA_STORE,
  EndpointName.MINT_ASSET,
  EndpointName.BURN_ASSET_INSTANCE,
  EndpointName.DELETE_ASSETS,
  // V2 Inventory Endpoints (Real endpoints)
  EndpointName.GET_INVENTORY_V2_ANIMATION_LIBRARY,
  EndpointName.GET_INVENTORY_V2_AVATAR_DNA,
  EndpointName.GET_INVENTORY_V2_AVATAR_EYES,
  EndpointName.GET_INVENTORY_V2_AVATAR_FLAIR,
  EndpointName.GET_INVENTORY_V2_AVATAR_MAKEUP,
  EndpointName.GET_INVENTORY_V2_COLOR_PRESETS,
  EndpointName.GET_INVENTORY_V2_IMAGE_LIBRARY,
  EndpointName.GET_INVENTORY_V2_MODEL_LIBRARY,
  EndpointName.GET_INVENTORY_V2_AVATAR,
  EndpointName.GET_INVENTORY_V2_DECOR,
  EndpointName.GET_INVENTORY_V2_GEAR,
  // Default Items Endpoints
  EndpointName.GET_DEFAULT_GEAR,
  EndpointName.GET_DEFAULT_DECOR,
  EndpointName.GET_DEFAULT_AVATAR,
  EndpointName.GET_DEFAULT_AVATAR_DNA,
  EndpointName.GET_DEFAULT_AVATAR_MAKEUP,
  EndpointName.GET_DEFAULT_AVATAR_FLAIR,
  EndpointName.GET_DEFAULT_AVATAR_EYES,
  EndpointName.GET_DEFAULT_COLOR_PRESETS,
  EndpointName.GET_DEFAULT_IMAGE_LIBRARY,
  EndpointName.GET_DEFAULT_ANIMATION_LIBRARY,
  EndpointName.GET_DEFAULT_MODEL_LIBRARY,
  // Metadata Store Manager Endpoints
  EndpointName.GET_ALL_METADATA_STORES,
  EndpointName.CREATE_DEFAULT_CLOSET_NAMESPACE,
  EndpointName.CREATE_DEFAULT_ITEM,
  EndpointName.UPDATE_METADATA_TAG,
  // Inventory Moderation Endpoints
  EndpointName.CREATE_MODERATION_METADATA_STORE,
  EndpointName.CREATE_ASSET_STATUS_METADATA_STORE,
  EndpointName.UPDATE_ASSET_MODERATION_STATUS,
  EndpointName.UPDATE_ASSET_LIFECYCLE_STATUS,
  EndpointName.GET_ASSETS_BY_MODERATION_STATUS,
  EndpointName.GET_ASSET_MODERATION_STATUS,
  EndpointName.SUBMIT_ASSET_FOR_REVIEW,
];

const piplelineEndpoints: Array<string> = [
  EndpointName.GET_GEAR_BY_ID,
  EndpointName.UPDATE_GEAR,
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let responseStatus = 200;
  try {
    // get the accessToken from cookies
    const cookies = cookie.parse(req.headers.cookie || '');
    const accessToken = cookies[ACCESS_TOKEN_KEY] || null;

    if (!accessToken) {
      throw new Error('Could not get access token from user');
    }

    const { query } = req ?? {};
    const endpoint = query?.endpoint as string;
    let url;
    let method;

    const isConsumerEndpoint = consumerEndpoints.includes(endpoint);

    const isPipelineEndpoint = piplelineEndpoints.includes(endpoint);

    if (
      endpoint === EndpointName.GET_GEAR_BY_ID ||
      endpoint === EndpointName.UPDATE_GEAR
    ) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/pipeline/gear/${query?.gearId}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_GEAR_LIST_ADMIN) {
      const limit = query?.limit as string;
      const cursor = encodeURIComponent(query?.cursor as string);
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/gears/?cursor=${cursor}&limit=${limit}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_THINGS_ADMIN) {
      const limit = query?.limit as string;
      const cursor = encodeURIComponent(query?.cursor as string);
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/things/?cursor=${cursor}&limit=${limit}`;
      method = req.method;
    } else if (endpoint === EndpointName.DELETE_THINGS_ADMIN) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/things/${query?.thingId}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_USER_TRAIT_PROFILE) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v1/user/${query.userId}/profile`;
      if (query.traitId?.length > 0) {
        url += `&traitId=${query.traitId}`;
      }
      method = req.method;
    } else if (endpoint === EndpointName.GET_TRAITS) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v1/trait?status=${query.status}`;
      if (query.traitId?.length > 0) {
        url += `&traitId=${query.traitId}`;
      }
      method = req.method;
    } else if (endpoint === EndpointName.RESET_TRAIT_PROFILE) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/user/${query.userId}/trait`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_TRAIT_PROGRESS) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/user/${query.userId}/trait/status`;
      method = req.method;
    } else if (endpoint === EndpointName.SET_TRAIT_SOCRE) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/user/${query.userId}/trait`;
      method = req.method;
    } else if (endpoint === EndpointName.FORCE_ADD_HARD_CURRENCY) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/hard-currency/${query.userId}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_TRANSACTION_HISTORY) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/transaction-history/${query.userId}`;
      let page = '1';
      let pageSize = '10';
      let store = '';
      if (query.page?.length > 0) {
        page = `${query.page}`;
      }
      if (query.page_size?.length > 0) {
        pageSize = `${query.page_size}`;
      }
      if (query.store?.length > 0) {
        store = `${query.store}`;
      }
      url += `?page=${page}&page_size=${pageSize}&store=${store}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_HARD_CURRENCY_PRODUCTS) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/hard-currency/product/mapping`;
      if (query.partyId?.length > 0) {
        url += `?party_id=${query.partyId}`;
      }
      method = req.method;
    } else if (endpoint === EndpointName.UPDATE_HARD_CURRENCY_PRODUCT) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/hard-currency/product`;
      method = req.method;
    } else if (endpoint === EndpointName.ADD_HARD_CURRENCY_PRODUCT) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/hard-currency/product`;
      method = req.method;
    } else if (endpoint === EndpointName.UPSERT_HC_PRODUCT_SKU_MAPPING) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/hard-currency/product/mapping`;
      method = req.method;
    } else if (endpoint === EndpointName.UPSERT_HC_PRODUCT_METADATA) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/hard-currency/product/metadata`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_ALL_HC_PRODUCT_METADATA) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/hard-currency/product/metadata`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_ALL_SOFT_CURRENCY_PRODUCTS) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/soft-currency/product?currencyId=${query.currencyId}`;
      url += `&include_inactive=${query.include_inactive}`;
      url += `&include_metadata=${query.include_metadata}`;
      method = req.method;
    } else if (endpoint === EndpointName.UPDATE_SOFT_CURRENCY_PRODUCT) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/soft-currency/product`;
      method = req.method;
    } else if (endpoint === EndpointName.ADD_SOFT_CURRENCY_PRODUCT) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/soft-currency/product`;
      method = req.method;
    } else if (endpoint === EndpointName.DELETE_SOFT_CURRENCY_PRODUCT) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/soft-currency/product/${query.currencyId}/${query.productSku}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_ALL_CURRENCIES_FOR_OWNER) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/soft-currency/${query.ownerId}`;
      if (query.externalOwnerId) {
        url += `?externalOwnerId=${query.externalOwnerId}`;
      }
      method = req.method;
    } else if (endpoint === EndpointName.UPSERT_SOFT_CURRENCY) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/soft-currency`;
      method = req.method;
    } else if (endpoint === EndpointName.DELETE_SOFT_CURRENCY) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/economy/soft-currency/${query.currencyId}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_ADMIN_USER_INVENTORY) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/user/${query.userId}`;

      // Add optional query parameters if they exist
      const queryParams = [];
      if (query.category) {
        queryParams.push(`category=${query.category}`);
      }
      if (query.color) {
        queryParams.push(`color=${query.color}`);
      }
      if (query.nextCursor) {
        queryParams.push(`nextCursor=${query.nextCursor}`);
      }
      if (query.limit) {
        queryParams.push(`limit=${query.limit}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      method = req.method;
    } else if (endpoint === EndpointName.CREATE_METADATA_STORE) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/metadata?namespace=${query.namespace}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_METADATA_TAG) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/metadata/tag?namespace=${query.namespace}&tagId=${query.tagId}`;
      method = 'GET';
    } else if (endpoint === EndpointName.SET_METADATA_TAG) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/metadata/tag?namespace=${query.namespace}&metadataStoreKey=${query.metadataStoreKey}`;
      method = req.method;
    } else if (endpoint === EndpointName.CREATE_ASSET_SUPPLY) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/assets`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_METADATA_STORE) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/metadata?namespace=${query.namespace}`;
      method = req.method;
    } else if (endpoint === EndpointName.MINT_ASSET) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/assets/instance`;
      method = req.method;
    } else if (endpoint === EndpointName.BURN_ASSET_INSTANCE) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/assets/instance?instanceId=${query.instanceId}`;
      method = req.method;
    } else if (endpoint === EndpointName.DELETE_ASSETS) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/assets/delete`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_INVENTORY_V2_ANIMATION_LIBRARY) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/user/${query.userId}/animation-library`;
      const queryParams = [];
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_INVENTORY_V2_AVATAR_DNA) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/user/${query.userId}/avatar/dna`;
      const queryParams = [];
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_INVENTORY_V2_AVATAR_EYES) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/user/${query.userId}/avatar/eyes`;
      const queryParams = [];
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_INVENTORY_V2_AVATAR_FLAIR) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/user/${query.userId}/avatar/flair`;
      const queryParams = [];
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_INVENTORY_V2_AVATAR_MAKEUP) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/user/${query.userId}/avatar/makeup`;
      const queryParams = [];
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_INVENTORY_V2_COLOR_PRESETS) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/user/${query.userId}/color-presets`;
      const queryParams = [];
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_INVENTORY_V2_IMAGE_LIBRARY) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/user/${query.userId}/image-library`;
      const queryParams = [];
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_INVENTORY_V2_MODEL_LIBRARY) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/user/${query.userId}/model-library`;
      const queryParams = [];
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_INVENTORY_V2_AVATAR) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/user/${query.userId}/avatar`;
      const queryParams = [];
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_INVENTORY_V2_DECOR) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/user/${query.userId}/decor`;
      const queryParams = [];
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_INVENTORY_V2_GEAR) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/user/${query.userId}/gear`;
      const queryParams = [];
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    }
    // Default Items Endpoints
    else if (endpoint === EndpointName.GET_DEFAULT_GEAR) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/defaults/gear`;
      const queryParams = [];
      if (query.orgId) queryParams.push(`orgId=${query.orgId}`);
      if (query.appId) queryParams.push(`appId=${query.appId}`);
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_DEFAULT_DECOR) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/defaults/decor`;
      const queryParams = [];
      if (query.orgId) queryParams.push(`orgId=${query.orgId}`);
      if (query.appId) queryParams.push(`appId=${query.appId}`);
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_DEFAULT_AVATAR) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/defaults/avatar`;
      const queryParams = [];
      if (query.orgId) queryParams.push(`orgId=${query.orgId}`);
      if (query.appId) queryParams.push(`appId=${query.appId}`);
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_DEFAULT_AVATAR_DNA) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/defaults/avatar/dna`;
      const queryParams = [];
      if (query.orgId) queryParams.push(`orgId=${query.orgId}`);
      if (query.appId) queryParams.push(`appId=${query.appId}`);
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_DEFAULT_AVATAR_MAKEUP) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/defaults/avatar/makeup`;
      const queryParams = [];
      if (query.orgId) queryParams.push(`orgId=${query.orgId}`);
      if (query.appId) queryParams.push(`appId=${query.appId}`);
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_DEFAULT_AVATAR_FLAIR) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/defaults/avatar/flair`;
      const queryParams = [];
      if (query.orgId) queryParams.push(`orgId=${query.orgId}`);
      if (query.appId) queryParams.push(`appId=${query.appId}`);
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_DEFAULT_AVATAR_EYES) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/defaults/avatar/eyes`;
      const queryParams = [];
      if (query.orgId) queryParams.push(`orgId=${query.orgId}`);
      if (query.appId) queryParams.push(`appId=${query.appId}`);
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_DEFAULT_COLOR_PRESETS) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/defaults/color-presets`;
      const queryParams = [];
      if (query.orgId) queryParams.push(`orgId=${query.orgId}`);
      if (query.appId) queryParams.push(`appId=${query.appId}`);
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_DEFAULT_IMAGE_LIBRARY) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/defaults/image-library`;
      const queryParams = [];
      if (query.orgId) queryParams.push(`orgId=${query.orgId}`);
      if (query.appId) queryParams.push(`appId=${query.appId}`);
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_DEFAULT_ANIMATION_LIBRARY) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/defaults/animation-library`;
      const queryParams = [];
      if (query.orgId) queryParams.push(`orgId=${query.orgId}`);
      if (query.appId) queryParams.push(`appId=${query.appId}`);
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_DEFAULT_MODEL_LIBRARY) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/defaults/model-library`;
      const queryParams = [];
      if (query.orgId) queryParams.push(`orgId=${query.orgId}`);
      if (query.appId) queryParams.push(`appId=${query.appId}`);
      if (query.category) queryParams.push(`category=${query.category}`);
      if (query.color) queryParams.push(`color=${query.color}`);
      if (query.nextCursor) queryParams.push(`nextCursor=${query.nextCursor}`);
      if (query.limit) queryParams.push(`limit=${query.limit}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      method = req.method;
    }
    // Moderation Endpoints
    else if (endpoint === EndpointName.GET_ASSETS_BY_MODERATION_STATUS) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/moderation/assets`;

      const queryParams = [];
      if (query['status']) {
        const status = query['status'];
        if (Array.isArray(status)) {
          status.forEach((s) => {
            queryParams.push(`status=${s}`);
          });
        } else {
          queryParams.push(`status=${status}`);
        }
      }
      if (query['moderationType']) {
        const moderationType = query['moderationType'];
        if (Array.isArray(moderationType)) {
          moderationType.forEach((s) => {
            queryParams.push(`moderationType=${s}`);
          });
        } else {
          queryParams.push(`moderationType=${moderationType}`);
        }
      }
      if (query.nextCursor) {
        queryParams.push(`nextCursor=${query.nextCursor}`);
      }
      if (query.limit) {
        queryParams.push(`limit=${query.limit}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      method = req.method;
    } else if (endpoint === EndpointName.UPDATE_ASSET_MODERATION_STATUS) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/moderation/assets/${query['assetId']}/status`;
      method = req.method;
    } else if (endpoint === EndpointName.GET_ASSET_MODERATION_STATUS) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/v2/inventory/moderation/assets/${query['assetId']}`;
      method = req.method;
    }
    // Metadata Store Manager Endpoints
    else if (endpoint === EndpointName.GET_ALL_METADATA_STORES) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/metadata-stores`;

      // Add optional query parameters if they exist
      const queryParams = [];
      if (query.type) {
        queryParams.push(`type=${query.type}`);
      }
      if (query.appId) {
        queryParams.push(`appId=${query.appId}`);
      }
      if (query.limit) {
        queryParams.push(`limit=${query.limit}`);
      }
      if (query.nextCursor) {
        queryParams.push(`nextCursor=${query.nextCursor}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      method = req.method;
    } else if (endpoint === EndpointName.CREATE_DEFAULT_CLOSET_NAMESPACE) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/metadata-stores/default-closet-namespace`;
      method = req.method;
    } else if (endpoint === EndpointName.CREATE_DEFAULT_ITEM) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/metadata-stores/default-item`;
      method = req.method;
    } else if (endpoint === EndpointName.UPDATE_METADATA_TAG) {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}/admin/inventory/metadata/tag/${query.tagId}?namespace=${query.namespace}&metadataStoreKey=${query.metadataStoreKey}`;
      method = req.method;
    } else {
      url = `${process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL}`;
      method = req.method;
    }

    let headers;
    if (isConsumerEndpoint) {
      headers = {
        Authorization: `Bearer ${accessToken}`,
        'x-client-hash': process.env.GENIES_ADMIN_CLIENT_HASH,
      };

      // Include party-id header for inventory API calls if it was passed from the query
      if (
        (endpoint === EndpointName.GET_ADMIN_USER_INVENTORY ||
          endpoint === EndpointName.CREATE_METADATA_STORE ||
          endpoint === EndpointName.GET_METADATA_TAG ||
          endpoint === EndpointName.SET_METADATA_TAG ||
          endpoint === EndpointName.CREATE_ASSET_SUPPLY ||
          endpoint === EndpointName.GET_METADATA_STORE ||
          endpoint === EndpointName.MINT_ASSET ||
          endpoint === EndpointName.BURN_ASSET_INSTANCE ||
          endpoint === EndpointName.DELETE_ASSETS ||
          // V2 Inventory endpoints (Real endpoints)
          endpoint === EndpointName.GET_INVENTORY_V2_ANIMATION_LIBRARY ||
          endpoint === EndpointName.GET_INVENTORY_V2_AVATAR_DNA ||
          endpoint === EndpointName.GET_INVENTORY_V2_AVATAR_EYES ||
          endpoint === EndpointName.GET_INVENTORY_V2_AVATAR_FLAIR ||
          endpoint === EndpointName.GET_INVENTORY_V2_AVATAR_MAKEUP ||
          endpoint === EndpointName.GET_INVENTORY_V2_COLOR_PRESETS ||
          endpoint === EndpointName.GET_INVENTORY_V2_IMAGE_LIBRARY ||
          endpoint === EndpointName.GET_INVENTORY_V2_MODEL_LIBRARY ||
          endpoint === EndpointName.GET_INVENTORY_V2_AVATAR ||
          endpoint === EndpointName.GET_INVENTORY_V2_DECOR ||
          endpoint === EndpointName.GET_INVENTORY_V2_GEAR ||
          // Default Items endpoints
          endpoint === EndpointName.GET_DEFAULT_GEAR ||
          endpoint === EndpointName.GET_DEFAULT_DECOR ||
          endpoint === EndpointName.GET_DEFAULT_AVATAR ||
          endpoint === EndpointName.GET_DEFAULT_AVATAR_DNA ||
          endpoint === EndpointName.GET_DEFAULT_AVATAR_MAKEUP ||
          endpoint === EndpointName.GET_DEFAULT_AVATAR_FLAIR ||
          endpoint === EndpointName.GET_DEFAULT_AVATAR_EYES ||
          endpoint === EndpointName.GET_DEFAULT_COLOR_PRESETS ||
          endpoint === EndpointName.GET_DEFAULT_IMAGE_LIBRARY ||
          endpoint === EndpointName.GET_DEFAULT_ANIMATION_LIBRARY ||
          endpoint === EndpointName.GET_DEFAULT_MODEL_LIBRARY ||
          // Metadata Store Manager endpoints
          endpoint === EndpointName.GET_ALL_METADATA_STORES ||
          endpoint === EndpointName.CREATE_DEFAULT_CLOSET_NAMESPACE ||
          endpoint === EndpointName.CREATE_DEFAULT_ITEM ||
          endpoint === EndpointName.UPDATE_METADATA_TAG) &&
        query.partyId
      ) {
        headers['party-id'] = query.partyId;
      }
    }
    if (isPipelineEndpoint) {
      headers = {
        'x-private-token': process.env.API_PIPELINE_TOKEN,
      };
    }

    // Enhanced debugging for CREATE_METADATA_STORE
    if (endpoint === EndpointName.CREATE_METADATA_STORE) {
      console.log('CREATE_METADATA_STORE API call details:');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('Headers:', JSON.stringify(headers, null, 2));
      console.log('Query params:', JSON.stringify(query, null, 2));
      console.log('Request body:', JSON.stringify(req?.body, null, 2));
    }

    // Add debug logging for the GET_METADATA_STORE endpoint
    if (endpoint === EndpointName.GET_METADATA_STORE) {
      console.log('GET_METADATA_STORE API call:');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('Headers:', JSON.stringify(headers, null, 2));
      console.log('Query params:', JSON.stringify(query, null, 2));
    }

    // Add debug logging for GET_METADATA_TAG endpoint
    if (endpoint === EndpointName.GET_METADATA_TAG) {
      console.log('GET_METADATA_TAG API call:');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('Headers:', JSON.stringify(headers, null, 2));
      console.log('Query params:', JSON.stringify(query, null, 2));
    }

    if (endpoint === EndpointName.SET_METADATA_TAG) {
      console.log('SET_METADATA_TAG API call:');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('Headers:', JSON.stringify(headers, null, 2));
      console.log('Query params:', JSON.stringify(query, null, 2));
      console.log('Request body:', JSON.stringify(req?.body, null, 2));
    }

    // Add debug logging for GET_ALL_METADATA_STORES endpoint
    if (endpoint === EndpointName.GET_ALL_METADATA_STORES) {
      console.log('GET_ALL_METADATA_STORES API call:');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('Headers:', JSON.stringify(headers, null, 2));
      console.log('Query params:', JSON.stringify(query, null, 2));
      console.log(
        'NEXT_PUBLIC_GENIES_SHIM_API_URL:',
        process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL,
      );
    }

    const response = await axios({
      method,
      url,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      data: req?.body,
    });

    responseStatus = response.status;
    res.status(responseStatus).json(response?.data);
  } catch (error) {
    Logger.getInstance().error(`nextjs shim error: ${error}`, {
      errorMessage: error.message,
      source: 'nextjs shim',
    });

    // If we have a response from the API, return its status and data
    if (error.response) {
      responseStatus = error.response.status;
      console.error('API error details:', {
        status: error.response.status,
        data: error.response.data,
        endpoint: req?.query?.endpoint,
        requestUrl: error.config?.url || 'unknown',
        requestMethod: error.config?.method || 'unknown',
        queryParams: req?.query || {},
      });
      res.status(responseStatus).json(error.response.data);
    } else {
      console.error('Non-response error:', error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    }
  }
  return;
}
