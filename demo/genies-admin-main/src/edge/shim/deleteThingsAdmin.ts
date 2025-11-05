import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';

const deleteThingsAdmin = async (thingId: string): Promise<any> => {
  try {
    await callShimAdmin(EndpointName.DELETE_THINGS_ADMIN, {
      thingId,
    });
  } catch (error) {
    console.error(`deleteThingsAdmin error: ${error.message}`);
    return null;
  }
};

export default deleteThingsAdmin;
