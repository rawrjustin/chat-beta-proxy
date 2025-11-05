import { UserTraitsResponse } from 'src/lib/swagger/devkit';
import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';

const getUserTraitProfile = async (
  userId: string,
  traitId?: string,
): Promise<UserTraitsResponse> => {
  try {
    const response = await callShimAdmin(EndpointName.GET_USER_TRAIT_PROFILE, {
      userId,
      traitId,
    });
    return response;
  } catch (err) {
    console.error(`getUserTraitsProfile error: ${err.message}`);
    return null;
  }
};

export default getUserTraitProfile;
