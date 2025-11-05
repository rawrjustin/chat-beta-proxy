import React, { Fragment } from 'react';
import {
  Image,
  Text,
  Link,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Flex,
} from 'src/theme';

const StarSeparator = () => (
  <Image src="/static/images/star.svg" alt="star" boxSize="24px" />
);

export interface BreadcrumbItems {
  title: string;
  href: string;
}

export interface BreadcrumbsProps {
  previous?: Array<BreadcrumbItems>;
  current: {
    title: string;
  };
}

const PopoverNavigator = (props: { previous?: Array<BreadcrumbItems> }) => {
  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button background="transparent" fontSize="36px" color="#AA99FF">
          ...
        </Button>
      </PopoverTrigger>
      <PopoverContent
        w="inherit"
        borderColor="transparent"
        backgroundColor="transparent"
      >
        <PopoverBody
          display="grid"
          bg="#27262F"
          pl={5}
          pr={10}
          borderRadius="8px"
        >
          {props.previous &&
            props.previous.map(
              ({ href, title }: BreadcrumbItems, key: number) => {
                return (
                  <Link
                    pt={1}
                    pb={1}
                    textStyle="popoverFont"
                    key={key}
                    href={href}
                    _hover={{ fontWeight: 600 }}
                  >
                    {title}
                  </Link>
                );
              },
            )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export function BreadcrumbHeader({ previous, current }: BreadcrumbsProps) {
  /** @mountz-if prev breadcrumb trail has a length > 2, we need to slice trail to new array and
   * send to popover component */
  const showLastPrevous = previous && previous.length > 0;
  const sliceIdx = previous && previous.length > 1 ? previous.length - 1 : 0;

  return (
    <Flex
      direction="row"
      pb="10"
      alignItems="center"
      maxW={{ md: '70vw', xl: '80vw' }}
    >
      {sliceIdx !== 0 && (
        <Fragment>
          <PopoverNavigator previous={previous?.slice(0, sliceIdx)} />
          <StarSeparator />
        </Fragment>
      )}
      {showLastPrevous && (
        <Link
          textStyle="h3"
          color="#AA99FF"
          maxW="50%"
          href={previous[sliceIdx].href}
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {previous[sliceIdx].title}
        </Link>
      )}
      {showLastPrevous && <StarSeparator />}
      <Text
        textStyle="h3"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {current.title}
      </Text>
    </Flex>
  );
}
