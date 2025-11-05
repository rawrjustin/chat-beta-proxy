import React, { Fragment } from 'react';
import { Text } from 'src/theme';
import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

/**
 *
 * returns formatted datetime string
 * isPDT is false by default, converts UTC+0 time to PDT
 * when isPDT=true, we format the date string to match the pattern, as the date is already in PDT time
 */
export const FormatUTCToPDT = ({
  date,
  contentColor,
  isBold,
  isPDT = false,
}: {
  date: string;
  contentColor?: string;
  isBold?: boolean;
  isPDT?: boolean;
}) => {
  const timeZone = 'America/Los_Angeles';
  const zonedDate = isPDT ? new Date(date) : utcToZonedTime(date, timeZone);

  const pattern = 'MM/dd/yyyy hh:mm a (z) ';
  const output = format(zonedDate, pattern, {
    timeZone: 'America/Los_Angeles',
  });
  return (
    <Fragment>
      <Text
        fontWeight={isBold ? 800 : 400}
        display="inline"
        color={contentColor}
      >
        {output}
      </Text>
    </Fragment>
  );
};

export const formatPDTToUTC = (date: string) => {
  const timeZone = 'America/Los_Angeles';
  const utcDate = zonedTimeToUtc(date, timeZone);
  //regex removes milliseconds from string
  return utcDate.toISOString().replace(/\.[0-9]{3}/, '');
};

export const formatTimestampToDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};
