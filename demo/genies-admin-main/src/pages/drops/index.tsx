import React from 'react';
import type { NextPage } from 'next';
import PageHeader from 'src/modules/PageHeader';
import Head from 'src/general/components/Head';
import {
  ActionsContainer,
  ExportAction,
  CreateAction,
  Actions,
} from 'src/modules/Actions/Index';
import { DropTabContainer } from 'src/modules/drops/DropTabContainer';
import { useGetFeatureFlags, AdminFeatureFlags } from 'src/lib/statsig';
import { ContentLayoutWrapper } from 'src/general/components/Layout';

const Drops: NextPage = () => {
  const enableExportAction = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_EXPORT_ACTION,
  );
  const enableCreateDrop = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_CREATE_DROP,
  );
  return (
    <React.Fragment>
      <Head subtitle="Drops" />
      <ContentLayoutWrapper
        pageHeader={<PageHeader title="Drops" />}
        mainContent={<DropTabContainer />}
        actionsContainer={
          <ActionsContainer>
            {enableCreateDrop && (
              <CreateAction action={Actions.CREATE_DROP_ACTION} />
            )}
            {enableExportAction && <ExportAction />}
          </ActionsContainer>
        }
      />
    </React.Fragment>
  );
};

export default Drops;
