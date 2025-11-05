import { NextPage } from 'next';
import { Fragment, useCallback, useEffect, useState } from 'react';
import getTraitProgress from 'src/edge/shim/traits/getTraitProgress';
import Logger from 'shared/logger';
import getUserTraitProfile from 'src/edge/shim/traits/getUserTraitProfile';
import resetTraitProfile from 'src/edge/shim/traits/resetTraitProfile';
import setTraitScore from 'src/edge/shim/traits/setTraitScore';
import Head from 'src/general/components/Head';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import {
  AdminGetTraitStatusResponse,
  UserTraitsResponseProfile,
} from 'src/lib/swagger/devkit';
import { ActionsContainer } from 'src/modules/Actions/ActionsContainer';
import ResetTraitProfileAction from 'src/modules/Actions/ResetTraitProfileAction';
import PageHeader from 'src/modules/PageHeader';
import TraitTabContent from 'src/modules/traits/TraitTabContent';
import { useToast } from 'src/theme';
import { useUser } from 'src/lib/user/UserContext';

const TraitProfile: NextPage = () => {
  const { userId } = useUser();
  console.log('userId', userId);
  const toast = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<
    Array<UserTraitsResponseProfile>
  >([]);
  const [noProfile, setNoProfile] = useState<boolean>();
  const [traitProgress, setTraitProgress] =
    useState<AdminGetTraitStatusResponse>({});

  const fetchTraitsData = useCallback(async () => {
    setLoading(true);
    const res = await getUserTraitProfile(userId);
    // sort by highest value
    setProfileData(res.profile.sort((a, b) => b.value - a.value));
    const noProfile = !res.profile.find((p) => p.value > 0);
    setNoProfile(noProfile);

    const traitProgress = await getTraitProgress(userId);
    setTraitProgress(traitProgress);

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchTraitsData();
  }, [fetchTraitsData, userId]);

  const onSetTraitScore = async (traitId: string, score: number) => {
    try {
      await setTraitScore(userId, traitId, score);
      toast({
        title: 'Success.',
        description: `Set trait score successfully`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
      fetchTraitsData();
      window.scrollTo({ top: 0 });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to set trait score',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(
        `admin set trait score error: ${err.message}`,
        {
          errorMessage: err.message,
          source: 'onSetTraitScore',
        },
      );
    }
  };

  const onResetTraitProfile = async () => {
    try {
      await resetTraitProfile(userId);
      toast({
        title: 'Success.',
        description: `Reset trait profile successfully`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
      fetchTraitsData();
      window.scrollTo({ top: 0 });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to reset trait profile',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
      Logger.getInstance().error(`reset user profile error: ${err.message}`, {
        errorMessage: err.message,
        source: 'onResetTraitProfile',
      });
    }
  };

  return (
    <Fragment>
      <Head subtitle="Traits" />
      <ContentLayoutWrapper
        pageHeader={<PageHeader title="Traits" />}
        mainContent={
          <TraitTabContent
            noProfile={noProfile}
            loading={loading}
            profileData={profileData}
            traitsProgress={traitProgress}
            onEditScore={onSetTraitScore}
          />
        }
        actionsContainer={
          <ActionsContainer>
            <ResetTraitProfileAction
              disabled={noProfile}
              onResetProfile={onResetTraitProfile}
            />
          </ActionsContainer>
        }
      />
    </Fragment>
  );
};

export default TraitProfile;
