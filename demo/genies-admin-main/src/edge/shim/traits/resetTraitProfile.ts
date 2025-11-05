import callShimAdmin, { EndpointName } from '../callShimAdmin';

const resetTraitProfile = async (userId: string): Promise<void> => {
  try {
    await callShimAdmin(EndpointName.RESET_TRAIT_PROFILE, {
      userId,
    });
  } catch (error) {
    console.error(`resetTraitProfile error: ${error.message}`);
  }
};

export default resetTraitProfile;
