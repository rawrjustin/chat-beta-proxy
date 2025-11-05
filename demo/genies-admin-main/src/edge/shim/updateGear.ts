import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';

const updateGear = async (
  gearId: string,
  gearVersionId: string,
  status: string,
  reviewerComment: string,
): Promise<any> => {
  try {
    await callShimAdmin(
      EndpointName.UPDATE_GEAR,
      {
        gearId,
      },
      {
        gearId,
        gearVersionId,
        status,
        reviewerComment,
      },
    );
  } catch (error) {
    console.error(`updateGear error: ${error.message}`);
  }
};

export default updateGear;
