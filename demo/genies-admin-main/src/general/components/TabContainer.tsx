import React from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from 'src/theme';

export interface TabConfig {
  name: string;
  content: React.ReactElement;
}

export const TabContainer = ({ config }: { config: TabConfig[] }) => {
  const tabNameProps = {
    textStyle: 'tabName',
    _selected: { color: 'white', borderBottom: '4px', borderColor: 'whilte' },
  };
  return (
    <Tabs variant="unstyled">
      <TabList>
        {config.map((tab, index) => (
          <Tab key={index} {...tabNameProps}>
            {tab.name}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {config.map((tab, index) => (
          <TabPanel key={index}>{tab.content}</TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};
