import React from 'react';
import type { NextPage } from 'next';
import Head from 'src/general/components/Head';
import PageHeader from 'src/modules/PageHeader';
import { CollectionsUnlimitedList } from 'src/modules/collections';
import {
  ActionsContainer,
  ExportAction,
  CreateAction,
  Actions,
} from 'src/modules/Actions/Index';
import { useGetFeatureFlags, AdminFeatureFlags } from 'src/lib/statsig';
import { ContentLayoutWrapper } from 'src/general/components/Layout';

const Collections: NextPage = () => {
  const enableExportAction = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_EXPORT_ACTION,
  );
  const enableCreateCollection = useGetFeatureFlags(
    AdminFeatureFlags.ENABLE_CREATE_COLLECTION,
  );

  return (
    <React.Fragment>
      <Head subtitle="Collections" />
      <ContentLayoutWrapper
        pageHeader={<PageHeader title="Collections" />}
        mainContent={<CollectionsUnlimitedList />}
        actionsContainer={
          <ActionsContainer>
            {enableCreateCollection && (
              <CreateAction action={Actions.CREATE_COLLECTION_ACTION} />
            )}
            {enableExportAction && <ExportAction />}
          </ActionsContainer>
        }
      />
    </React.Fragment>
  );
};

export default Collections;
