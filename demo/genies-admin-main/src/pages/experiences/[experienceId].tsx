import { useQuery } from '@apollo/client';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Logger from 'shared/logger';
import { searchExperiencesQuery } from 'src/edge/gql/consumer/searchExperiencesQuery';
import { CursorDirection } from 'src/edge/__generated/types/admin/globalTypes';
import { ExperienceStatus } from 'src/edge/__generated/types/consumer/globalTypes';
import { searchExperiences_searchExperiences_experiences } from 'src/edge/__generated/types/consumer/searchExperiences';
import Head from 'src/general/components/Head';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import { TabConfig, TabContainer } from 'src/general/components/TabContainer';
import { useConsumerClient } from 'src/lib/apollo/MultiApolloProvider';
import { ExperienceBuildsUnlimitedList } from 'src/modules/experiences/details/ExperienceBuildsUnlimitedList';
import { ExperienceDetailsForm } from 'src/modules/experiences/details/ExperienceDetailsForm';
import PageHeader from 'src/modules/PageHeader';
import { experiences } from 'src/modules/routes';
import { Skeleton } from 'src/theme';

const ExperienceDetail: NextPage = () => {
  const router = useRouter();
  const consumerClient = useConsumerClient();
  const [experienceId, setExperienceId] = useState<string>();
  const [experienceName, setExperienceName] = useState<string>();
  const [experienceDetails, setExperienceDetails] =
    useState<searchExperiences_searchExperiences_experiences>(null);

  useEffect(() => {
    const { experienceId } = router.query;
    const id = Array.isArray(experienceId) ? experienceId[0] : experienceId;
    setExperienceId(id);
  }, [router.query]);

  const { data, loading, error } = useQuery(searchExperiencesQuery, {
    client: consumerClient,
    variables: {
      input: {
        base: {
          pagination: {
            cursor: '',
            direction: CursorDirection.RIGHT,
            limit: 12,
          },
        },
        filters: {
          withBuilds: true,
          byExperienceIDs: [experienceId],
          byExperienceStatus: ExperienceStatus.ALL,
        },
      },
    },
    skip: !experienceId?.length,
  });

  if (error) {
    Logger.getInstance().error(
      `Search experience query error:  ${error?.message}`,
      {
        errorMessage: error,
        source: 'searchExperiencesQuery',
      },
    );
  }

  useEffect(() => {
    if (data?.searchExperiences?.experiences?.[0]) {
      const experiece = data.searchExperiences.experiences[0];
      setExperienceDetails(experiece);
      setExperienceName(experiece.name);
    }
  }, [data]);

  const tabConfig: TabConfig[] = [
    {
      name: 'Info',
      content: (
        <ExperienceDetailsForm
          loading={loading}
          experienceDetails={experienceDetails}
        />
      ),
    },
    {
      name: 'Builds',
      content: <ExperienceBuildsUnlimitedList experienceId={experienceId} />,
    },
  ];

  if (!loading && !experienceDetails) return null;

  return (
    <React.Fragment>
      <Head subtitle="Experiences" />
      <ContentLayoutWrapper
        pageHeader={
          <PageHeader
            title={experienceName}
            previous={[{ title: 'Experiences', href: experiences() }]}
          />
        }
        mainContent={
          <Skeleton isLoaded={experienceId && experienceId.length > 0}>
            <TabContainer config={tabConfig} />
          </Skeleton>
        }
      />
    </React.Fragment>
  );
};

export default ExperienceDetail;
