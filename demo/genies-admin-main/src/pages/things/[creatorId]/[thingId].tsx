import { NextPage } from 'next';
import Head from 'src/general/components/Head';
import { Fragment, useEffect, useState } from 'react';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import PageHeader from 'src/modules/PageHeader';
import { Skeleton } from 'src/theme';
import { TabConfig, TabContainer } from 'src/general/components/TabContainer';
import { useRouter } from 'next/router';
import {
  ThingDetailsForm,
  ThingDetailsProps,
} from 'src/modules/things/ThingDetailsForm';
import {
  ThingBuildsProps,
  ThingBuildsUnlimitedList,
} from 'src/modules/things/ThingBuildsUnlimitedList';
import { formatTimestampToDate } from 'src/general/components/DateTime';
import {
  generateAuthHeader,
  getApiConfig,
  useAccessToken,
} from 'src/lib/swagger/mobile/util';
import { ThingsApi } from 'src/lib/swagger/mobile';
import { ThingVersionStatus } from 'src/modules/things/types';
import { things } from 'src/modules/routes';
import { getUserProfileQuery } from 'src/edge/gql/consumer/getUserProfileQuery';
import { useConsumerClient } from 'src/lib/apollo/MultiApolloProvider';
import { useQuery } from '@apollo/client';
import Logger from 'shared/logger';

const ThingDetail: NextPage = () => {
  const router = useRouter();
  const { thingId, creatorId } = router.query as { thingId: string; creatorId };
  const accessToken = useAccessToken();
  const [loading, setLoading] = useState<boolean>(false);
  const [thingDetails, setThingDetails] = useState<ThingDetailsProps>(null);
  const [thingVersions, setThingVersions] =
    useState<Array<ThingBuildsProps>>(null);
  const consumerClient = useConsumerClient();
  const { data, error } = useQuery(getUserProfileQuery, {
    variables: {
      searchInput: {
        sub: creatorId,
      },
    },
    client: consumerClient,
    skip: !creatorId,
  });

  if (error) {
    Logger.getInstance().error(`getUserProfileQuery error: ${error.message}`, {
      errorMessage: error.message,
      source: 'ThingDetail',
    });
  }

  useEffect(() => {
    const getThingsVersion = async () => {
      if (!accessToken || !thingId) return;

      setLoading(true);
      const api = new ThingsApi(getApiConfig());
      const res = await api.getThingsVersion(
        thingId,
        ThingVersionStatus.ALL,
        null,
        generateAuthHeader(accessToken),
      );

      if (res?.thingVersions) {
        setThingDetails({
          name: res.thingVersions[0].name,
          description: res.thingVersions[0].description,
          thingId: res.thingVersions[0].thingId,
          lastModifiedAt: formatTimestampToDate(
            res.thingVersions[0].lastModifiedAt,
          ),
          creatorId: creatorId,
        });
        const thingVersionsData: Array<ThingBuildsProps> =
          res.thingVersions.map((v) => ({
            thingVersionId: v.id,
            status: v.status,
            reviewerId: v.reviewerId,
            version: v.version,
            reviewerComment: v.reviewerComment,
          }));
        setThingVersions(thingVersionsData);
      }

      setLoading(false);
    };
    getThingsVersion();
  }, [accessToken, thingId]);

  useEffect(() => {
    if (data?.getUserProfile) {
      const firstName = data?.getUserProfile?.firstName || '';
      const lastName = data?.getUserProfile?.lastName || '';
      const prefUsername = data?.getUserProfile?.prefUsername || '';

      setThingDetails({
        ...thingDetails,
        creatorName: firstName + ' ' + lastName,
        creator: prefUsername,
      });
    }
  }, [data?.getUserProfile]);

  const tabConfig: TabConfig[] = [
    {
      name: 'Info',
      content: (
        <ThingDetailsForm
          loading={loading || !thingDetails}
          thingDetails={thingDetails}
        />
      ),
    },
    {
      name: 'Builds',
      content: (
        <ThingBuildsUnlimitedList
          loading={loading || !thingVersions}
          thingId={thingId}
          thingBuilds={thingVersions}
        />
      ),
    },
  ];

  if (!loading && !thingDetails) return null;

  return (
    <Fragment>
      <Head subtitle={`${thingDetails?.name}`} />
      <ContentLayoutWrapper
        pageHeader={
          <PageHeader
            title={thingDetails?.name || ''}
            previous={[
              {
                title: 'Things',
                href: things(),
              },
            ]}
          />
        }
        mainContent={
          <Skeleton isLoaded={!loading}>
            <TabContainer config={tabConfig} />
          </Skeleton>
        }
      />
    </Fragment>
  );
};

export default ThingDetail;
