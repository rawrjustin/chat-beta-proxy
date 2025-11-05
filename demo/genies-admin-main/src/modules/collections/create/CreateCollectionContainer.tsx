import React, { useState } from 'react';
import { Flex } from 'src/theme';
import { ActionsContainer } from 'src/modules/Actions/Index';
import { CreateCollection } from 'src/modules/collections/create/CreateCollection';
import { PublishCollectionAction } from 'src/modules/Actions/PublishCollectionAction';
import { SaveCollectionAction } from 'src/modules/Actions/SaveCollectionAction';

export interface NewCollectionProps {
  title: string;
  description: string;
  seriesFlowID: number;
  seriesName: string;
}

export const CreateCollectionContainer = () => {
  //@mountz-since the action buttons need context to the input in CreateDrop component
  //we maintain state in a parent component and pass down as props
  const [newCollectionInfo, setNewCollectionInfo] =
    useState<NewCollectionProps>({
      title: '',
      description: '',
      seriesFlowID: parseInt(process.env.NEXT_PUBLIC_GENIES_SERIES_FLOW_ID),
      seriesName: process.env.NEXT_PUBLIC_GENIES_SERIES_NAME,
    });

  return (
    <React.Fragment>
      <Flex>
        <Flex w="full" justify="center" flexDirection="column" mb={48}>
          <CreateCollection
            newCollectionInfo={newCollectionInfo}
            setNewCollectionInfo={setNewCollectionInfo}
          />
        </Flex>
        <Flex w="2xs" ml={25} mr={25} align="flex-start">
          <ActionsContainer>
            <SaveCollectionAction draftCollectionInfo={newCollectionInfo} />
            <PublishCollectionAction newCollectionInfo={newCollectionInfo} />
          </ActionsContainer>
        </Flex>
      </Flex>
    </React.Fragment>
  );
};
