import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GearGetByIdResponse } from 'src/lib/swagger/devkit/api';

const getGearById = async (gearId: string): Promise<GearGetByIdResponse> => {
  try {
    const response = await callShimAdmin(EndpointName.GET_GEAR_BY_ID, {
      gearId: gearId,
    });
    return response?.gear;
  } catch (error) {
    console.error(`getGearById error: ${error.message}`);
    return null;
  }
};

export default getGearById;
