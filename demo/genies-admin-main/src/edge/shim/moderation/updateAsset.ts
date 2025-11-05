import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import {
  ModerationStatus,
  ModerationStatusResponse,
  ModerationType,
} from 'src/lib/swagger/admin';

const updateAsset = async (
  assetId: string,
  status: ModerationStatus,
  moderationType: ModerationType,
  reviewNotes: string = '',
): Promise<ModerationStatusResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.UPDATE_ASSET_MODERATION_STATUS,
      {
        assetId,
      },
      { status, reviewNotes, moderationType },
    )) as ModerationStatusResponse;

    return (
      response || {
        assets: [],
        nextCursor: '',
        total: 0,
      }
    );
  } catch (error) {
    console.error(`updateAsset error: ${error.message}`);
    return {
      assets: [],
      nextCursor: '',
      total: 0,
    };
  }
};

export default updateAsset;
