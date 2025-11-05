import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { ThingsAdminGetResponse } from 'src/lib/swagger/mobile';

const getThingsAdmin = async (
  cursor: string,
  gearLimit: number,
): Promise<ThingsAdminGetResponse> => {
  try {
    const response = await callShimAdmin(EndpointName.GET_THINGS_ADMIN, {
      cursor,
      limit: gearLimit,
    });

    return response;
  } catch (error) {
    console.error(`getThingsAdmin error: ${error.message}`);
    return null;
  }
};

export default getThingsAdmin;
