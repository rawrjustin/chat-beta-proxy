// eslint-disable-next-line no-restricted-imports
import { extendTheme, ThemeOverride } from '@chakra-ui/react';
// eslint-disable-next-line no-restricted-imports
import type { ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};
const themeOverride: ThemeOverride = {
  config,
  colors: {
    header: {
      gradientStart: '#9382FF',
      gradientEnd: '#249F5D',
    },
    searchBar: {
      border: '#76DEB8',
    },
    users: {
      purple: '#AA99FF',
    },
  },
  textStyles: {
    h3: {
      fontSize: '32px',
      fontWeight: 'bold',
      fontFamily: 'Monument Extended Regular',
    },
    h4: {
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'Monument Extended Regular',
    },
    popoverFont: {
      fontSize: '18px',
      fontWeight: '400',
      fontFamily: 'Roobert Regular',
    },
    userDetailFont: {
      fontSize: '16px',
      fontFamily: 'Roobert Regular',
    },
    inputLabelFont: {
      fontSize: '24px',
      fontWeight: '600',
      fontFamily: 'Roobert Regular',
    },
    actionsFont: {
      color: '#8F8BA3',
      fontWeight: 700,
      fontSize: '20px',
      fontFamily: 'Roobert Regular',
    },
    modalHeader: {
      fontSize: '24px',
      fontFamily: 'Monument Extended Regular',
    },
    tabName: {
      fontSize: '12px',
      fontFamily: 'Monument Extended Regular',
      color: '#AA99FF',
    },
  },
};

export default extendTheme(themeOverride);
