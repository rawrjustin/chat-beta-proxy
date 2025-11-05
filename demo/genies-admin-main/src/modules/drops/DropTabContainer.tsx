import React, { useState } from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from 'src/theme';
import { DropUnlimitedList } from 'src/modules/drops';
import { DropStatus } from 'src/edge/__generated/types/consumer/globalTypes';
import { DROP_PAGE_SIZE } from 'src/modules/drops/DropsUnlimitedList';

export const DropTabContainer = () => {
  const [currentCount, setCurrentCount] = useState<Number>(0);
  const [upcomingCount, setUpcommingCount] = useState<Number>(0);
  const [pastCount, setPastCount] = useState<Number>(0);

  const tabNameProps = {
    textStyle: 'tabName',
    _selected: { color: 'white', borderBottom: '4px', borderColor: 'white' },
  };

  return (
    <Tabs variant="unstyled">
      <TabList>
        <Tab key={DropStatus.CURRENT} {...tabNameProps}>
          {currentCount < DROP_PAGE_SIZE
            ? `Current Drops (${currentCount})`
            : `Current Drops (${DROP_PAGE_SIZE}+)`}
        </Tab>
        <Tab key={DropStatus.UPCOMING} {...tabNameProps}>
          {upcomingCount < DROP_PAGE_SIZE
            ? `Upcoming Drops (${upcomingCount})`
            : `Upcoming Drops (${DROP_PAGE_SIZE}+)`}
        </Tab>
        <Tab key={DropStatus.RETIRED} {...tabNameProps}>
          {pastCount < DROP_PAGE_SIZE
            ? `Past Drops (${pastCount})`
            : `Past Drops (${DROP_PAGE_SIZE}+)`}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel key={DropStatus.CURRENT}>
          <DropUnlimitedList
            DropStatus={[DropStatus.CURRENT]}
            updateCount={setCurrentCount}
          />
        </TabPanel>
        <TabPanel key={DropStatus.UPCOMING}>
          <DropUnlimitedList
            DropStatus={[DropStatus.UPCOMING]}
            updateCount={setUpcommingCount}
          />
        </TabPanel>
        <TabPanel key={DropStatus.RETIRED}>
          <DropUnlimitedList
            DropStatus={[DropStatus.RETIRED]}
            updateCount={setPastCount}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
