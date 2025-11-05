import { AdminGetTraitStatusResponse } from 'src/lib/swagger/devkit';
import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';

const getTraitProgress = async (
  userId: string,
): Promise<AdminGetTraitStatusResponse> => {
  try {
    const response = (await callShimAdmin(EndpointName.GET_TRAIT_PROGRESS, {
      userId,
    })) as AdminGetTraitStatusResponse;
    return response;
  } catch (err) {
    console.error(`getUserTraitsProfile error: ${err.message}`);
    return null;
  }
};

export default getTraitProgress;
