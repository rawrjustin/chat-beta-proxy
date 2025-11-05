import React from 'react';
import {
  BreadcrumbHeader,
  BreadcrumbItems,
  BreadcrumbsProps,
} from 'src/general/components/Breadcrumb/Breadcrumb';
import { Box } from 'src/theme';

interface Props {
  title: string;
  previous?: Array<BreadcrumbItems>;
}

export default function PageHeader({ title, previous }: Props) {
  const breadCrumbsProps: BreadcrumbsProps = {
    current: { title: title },
    previous: previous,
  };

  return (
    <Box w="100%" h={14}>
      <BreadcrumbHeader {...breadCrumbsProps} />
    </Box>
  );
}
