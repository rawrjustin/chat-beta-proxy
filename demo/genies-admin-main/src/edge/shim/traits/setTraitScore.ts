import callShimAdmin, { EndpointName } from '../callShimAdmin';

const setTraitScore = async (
  userId: string,
  traitId: string,
  score: number,
): Promise<boolean> => {
  try {
    await callShimAdmin(
      EndpointName.SET_TRAIT_SOCRE,
      {
        userId,
      },
      {
        traitId,
        score,
      },
    );
    return true;
  } catch (err) {
    console.error(`setTraitScore error: ${err.message}`);
    return false;
  }
};
export default setTraitScore;
