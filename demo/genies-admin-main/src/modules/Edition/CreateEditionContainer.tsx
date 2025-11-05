import React, { useState } from 'react';
import { Flex } from 'src/theme';
import {
  ActionsContainer,
  PublishEditionAction,
} from 'src/modules/Actions/Index';
import {
  EditionDesignSlot,
  EditionImageInput,
  EditionRarity,
} from 'src/edge/__generated/types/admin/globalTypes';
import { CreateEdition } from './CreateEdition';
import { SaveDraftEditionAction } from '../Actions/SaveDraftEditionAction';

export interface NewEditionProps {
  name: string;
  description: string;
  rarity: EditionRarity;
  designSlot: EditionDesignSlot;
  publisher: string;
  avatarWearableSKU?: string;
  images?: (EditionImageInput | null)[] | null;
}

export interface EditionOption {
  value: string;
  label: string;
  imageUrl?: string;
}

export const CreateEditionContainer = ({
  collectionName,
  collectionFlowId,
}: {
  collectionName: string;
  collectionFlowId: number;
}) => {
  const [draftEditionID, setDraftEditionID] = useState<string>('');
  const [newEditionInfo, setNewEditionInfo] = useState<NewEditionProps>({
    name: '',
    description: '',
    publisher: '',
    rarity: undefined,
    designSlot: undefined,
    avatarWearableSKU: '',
  });
  const [imageFile, setImageFile] = React.useState<File>(null);

  return (
    <React.Fragment>
      <Flex>
        <Flex w="full" justify="center" flexDirection="column" mb={48}>
          <CreateEdition
            newEditionInfo={newEditionInfo}
            setNewEditionInfo={setNewEditionInfo}
            imageFile={imageFile}
            setImageFile={setImageFile}
          />
        </Flex>
        <Flex w="2xs" ml={25} mr={25} align="flex-start">
          <ActionsContainer>
            <SaveDraftEditionAction
              newEditionInfo={newEditionInfo}
              imageFile={imageFile}
              setDraftEditionID={setDraftEditionID}
              collectionFlowId={collectionFlowId}
              collectionName={collectionName}
            />
            <PublishEditionAction
              newEditionInfo={newEditionInfo}
              imageFile={imageFile}
              draftEditionID={draftEditionID}
              collectionFlowId={collectionFlowId}
              collectionName={collectionName}
            />
          </ActionsContainer>
        </Flex>
      </Flex>
    </React.Fragment>
  );
};
