import { NextPage } from 'next';
import Head from 'src/general/components/Head';
import React, { useState } from 'react';
import { ContentLayoutWrapper } from 'src/general/components/Layout';
import PageHeader from 'src/modules/PageHeader';
import { gears } from 'src/modules/routes';
import { Skeleton, Table, Tbody, Td, Tr, Text, Box } from 'src/theme';
import { FieldConfig, getValueByConfig } from 'src/modules/collections';
import { FormatUTCToPDT } from 'src/general/components/DateTime';
import { TableInitialLoadingSkeleton } from 'src/general/datatable/TableInitialLoadingSkeleton';
import getGearById from 'src/edge/shim/getGearById';
import { useRouter } from 'next/router';
import GearDetailsAdminActions from 'src/modules/gears/GearDetailsAdminActions';
import { getUserProfileQuery } from 'src/edge/gql/consumer/getUserProfileQuery';
import { useConsumerClient } from 'src/lib/apollo/MultiApolloProvider';
import { useQuery } from '@apollo/client';
import Logger from 'shared/logger';
import PreviewGenieWindow from 'src/modules/gears/PreviewGenieWindow';
import { GearCategory } from 'src/lib/swagger/devkit';

const gearDetailsFormConfig: FieldConfig[] = [
  { label: 'Item Name', key: 'name' },
  { label: 'Creator ID', key: 'creatorId' },
  { label: 'Creator', key: 'creator' },
  { label: 'Creator Name', key: 'creatorName' },
  { label: 'Description', key: 'description' },
  { label: 'ID', key: 'id' },
  {
    label: 'Created On',
    key: 'createdAt',
    render: (v: string) => {
      const timestamp = new Date(Number(v) * 1000).toISOString();
      return <FormatUTCToPDT date={timestamp} contentColor="grey.600" />;
    },
  },
  { label: 'Build Status', key: 'buildStatus' },
  { label: 'Content Build Status', key: 'contentBuildStatus' },
  {
    label: 'Status',
    key: 'status',
    render: (status: string) => {
      let color = '#FFE142';
      let statusText = 'AWAITING REVIEW';

      if (status === 'APPROVED') {
        color = '#4ADF97';
        statusText = 'APPROVED';
      } else if (status === 'REJECTED') {
        color = '#F87171';
        statusText = 'REJECTED';
      } else if (status === 'FLAG') {
        color = '#9D85FF';
        statusText = 'FLAGGED';
      } else if (status === 'PUBLISHED') {
        color = '#4ADF97';
        statusText = 'PUBLISHED';
      }
      return <Text color={color}>{statusText}</Text>;
    },
  },
  { label: 'Reviewer Comment', key: 'reviewerComment' },
];

const GearDetail: NextPage = () => {
  const router = useRouter();
  const { gearId } = router.query;
  const [gearDetails, setGearDetails] = useState<any>(null);
  const [combinedGearData, setCombinedGearData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const consumerClient = useConsumerClient();
  const { data, error } = useQuery(getUserProfileQuery, {
    variables: {
      searchInput: {
        sub: gearDetails?.creatorId,
      },
    },
    client: consumerClient,
    skip: !gearDetails?.creatorId,
  });

  if (error) {
    Logger.getInstance().error(`getUserProfileQuery error: ${error.message}`, {
      errorMessage: error.message,
      source: 'GearDetail',
    });
  }

  const fetchGearById = async () => {
    try {
      const response = await getGearById(gearId as string);
      setGearDetails(response);
    } catch (error) {
      console.error('Error fetching gear by id', error);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setLoading(true);
    if (!gearId) return;

    fetchGearById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gearId]);

  React.useEffect(() => {
    if (gearDetails && data?.getUserProfile) {
      const firstName = data?.getUserProfile?.firstName || '';
      const lastName = data?.getUserProfile?.lastName || '';
      const prefUsername = data?.getUserProfile?.prefUsername || '';
      setCombinedGearData({
        ...gearDetails,
        creatorName: firstName + ' ' + lastName,
        creator: prefUsername,
      });
    } else if (gearDetails && error) {
      setCombinedGearData({
        ...gearDetails,
      });
    }
    setLoading(false);
  }, [gearDetails, data?.getUserProfile, error]);

  return (
    <Box>
      <Head subtitle="Gears" />
      <Box display="flex" ml={2}>
        <Box flex="1">
          <ContentLayoutWrapper
            pageHeader={
              <PageHeader
                title={combinedGearData?.name}
                previous={[{ title: 'Gears', href: gears() }]}
              />
            }
            mainContent={
              <Skeleton isLoaded={gearId && gearId.length > 0}>
                <Table ml={4}>
                  <Tbody>
                    {loading || !combinedGearData ? (
                      <TableInitialLoadingSkeleton
                        rowNum={gearDetailsFormConfig.length}
                        columnNum={2}
                      />
                    ) : (
                      gearDetailsFormConfig.map(
                        (fieldConfig, index: number) => (
                          <Tr key={index}>
                            <Td maxW="2xs">
                              <Text
                                w="full"
                                textStyle="userDetailFont"
                                color="gray.400"
                              >
                                {fieldConfig.label}
                              </Text>
                            </Td>
                            <Td maxW="xs">
                              {fieldConfig.render ? (
                                fieldConfig.render(
                                  getValueByConfig(
                                    combinedGearData,
                                    fieldConfig,
                                  ),
                                )
                              ) : (
                                <Text
                                  w="full"
                                  textStyle="userDetailFont"
                                  color="grey.600"
                                >
                                  {getValueByConfig(
                                    combinedGearData,
                                    fieldConfig,
                                  )}
                                </Text>
                              )}
                            </Td>
                          </Tr>
                        ),
                      )
                    )}
                  </Tbody>
                </Table>
              </Skeleton>
            }
          />
          <Box mt={12} ml={4}>
            <GearDetailsAdminActions
              gearVersionId={gearDetails?.gearVersionId}
              existingReviewerComment={gearDetails?.reviewerComment}
            />
          </Box>
        </Box>
        <Box flex="0 0 400px" ml={40} mt={20}>
          {gearDetails?.renderingUrl?.length > 0 && (
            <PreviewGenieWindow
              canDownload={true}
              isAvatarPreview={gearDetails?.category === GearCategory.AVATAR}
              renderingUrl={gearDetails?.renderingUrl}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default GearDetail;
