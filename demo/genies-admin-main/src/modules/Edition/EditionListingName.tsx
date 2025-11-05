import React, { Fragment } from 'react';
import { Image, Flex } from 'src/theme';
import Link from 'next/link';
import { editionDetails, dropsEditionDetail } from '../routes';
export const EditionListingName = ({
  name,
  url,
  flowID,
  isDropEdition,
  id,
}: {
  name: string;
  url: string;
  flowID: number;
  isDropEdition: boolean;
  id: string;
}) => {
  return (
    <Fragment>
      <Flex align="center">
        {url && (
          <Flex mr={2}>
            <Image
              boxSize="64px"
              objectFit="cover"
              src={url}
              alt={name}
              display="inline"
            />
          </Flex>
        )}
        <Flex ml={2} display="inline" _hover={{ color: 'users.purple' }}>
          <Link
            href={
              isDropEdition
                ? dropsEditionDetail(flowID.toString())
                : editionDetails(id)
            }
          >
            {name}
          </Link>
        </Flex>
      </Flex>
    </Fragment>
  );
};
