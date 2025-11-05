import React, { useState } from 'react';
import { Flex } from 'src/theme';
import { CreateDrop } from 'src/modules/drops/create/CreateDrop';
import { ActionsContainer, PublishDropAction } from 'src/modules/Actions/Index';
import { useQuery } from '@apollo/client';
import { useAdminClient } from 'src/lib/apollo/MultiApolloProvider';
import { searchPublicEditionsQuery } from 'src/edge/gql/admin/searchEditionsQuery';
import {
  EditionImageType,
  PlatformStatus,
} from 'src/edge/__generated/types/admin/globalTypes';

export interface NewDropProps {
  title: string;
  description: string;
  publishTime?: string;
  startTime: string;
  endTime: string;
}

export interface EditionOption {
  value: string;
  label: string;
  imageUrl?: string;
}

export const CreateDropContainer = () => {
  //@mountz-since the action buttons need context to the input in CreateDrop component
  //we maintain state in a parent component and pass down as props
  const [newDropInfo, setNewDropInfo] = useState<NewDropProps>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  });
  const [selectedEdition, setSelectedEdition] = useState<EditionOption[]>([]);
  const [editionPrice, setEditionPrice] = useState({});
  const [imageFile, setImageFile] = React.useState<File>(null);
  const adminClient = useAdminClient();

  const { data } = useQuery(searchPublicEditionsQuery, {
    variables: {
      searchInput: {
        filters: {
          byPlatformStatus: PlatformStatus.PUBLIC,
        },
      },
    },
    client: adminClient,
  });

  const getImageURL = (edition, type: EditionImageType) => {
    const image = edition?.metadata?.images?.find(
      (image) => image.type.search(type) !== -1,
    );

    return image?.url ?? '';
  };

  const formattedEditionData: EditionOption[] = data
    ? data?.searchEditions?.editions
        .filter((edition) => !edition?.dropEditionID)
        .map((edition) => {
          return {
            dropEditionID: edition?.dropEditionID,
            value: edition?.id,
            label: edition?.name,
            imageUrl: getImageURL(
              edition,
              EditionImageType.EDITION_IMAGE_TYPE_HERO,
            ),
          };
        })
    : [];

  return (
    <React.Fragment>
      <Flex>
        <Flex w="full" justify="center" flexDirection="column" mb={48}>
          <CreateDrop
            newDropInfo={newDropInfo}
            setNewDropInfo={setNewDropInfo}
            formattedEditionData={formattedEditionData}
            editionPrice={editionPrice}
            setEditionPrice={setEditionPrice}
            imageFile={imageFile}
            setImageFile={setImageFile}
            selectedEdition={selectedEdition}
            setSelectedEdition={setSelectedEdition}
          />
        </Flex>
        <Flex w="2xs" ml={25} mr={25} align="flex-start">
          <ActionsContainer>
            <PublishDropAction
              newDropInfo={newDropInfo}
              imageFile={imageFile}
              editionPrice={editionPrice}
              selectedEdition={selectedEdition}
            />
          </ActionsContainer>
        </Flex>
      </Flex>
    </React.Fragment>
  );
};
