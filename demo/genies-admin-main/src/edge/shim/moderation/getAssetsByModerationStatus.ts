import qs from 'qs';
import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import {
  ModerationStatus,
  ModerationStatusResponse,
  ModerationType,
} from 'src/lib/swagger/admin';

const getAssetsByModerationStatus = async (
  status: ModerationStatus[],
  moderationType: ModerationType[],
  nextCursor?: string,
  limit?: number,
): Promise<ModerationStatusResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_ASSETS_BY_MODERATION_STATUS,
      {
        status: status,
        moderationType: moderationType,
        nextCursor,
        limit,
      },
      {},
      {
        paramsSerializer: (params) =>
          qs.stringify(params, { arrayFormat: 'repeat' }),
      },
    )) as ModerationStatusResponse;

    return (
      response || {
        assets: [],
        nextCursor: '',
        total: 0,
      }
    );
  } catch (error) {
    console.error(`getAssetsByModerationStatus error: ${error.message}`);
    return {
      assets: [],
      nextCursor: '',
      total: 0,
    };
  }
};

export default getAssetsByModerationStatus;
