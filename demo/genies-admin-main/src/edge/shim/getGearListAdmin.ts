import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GearListResponse } from 'src/lib/swagger/devkit';

const getGearListAdmin = async (
  cursor: string,
  gearLimit: number,
): Promise<GearListResponse> => {
  try {
    const response = await callShimAdmin(EndpointName.GET_GEAR_LIST_ADMIN, {
      cursor,
      limit: gearLimit,
    });

    return response;
  } catch (error) {
    console.error(`getGearListAdmin error: ${error.message}`);
    return null;
  }
};

export default getGearListAdmin;
