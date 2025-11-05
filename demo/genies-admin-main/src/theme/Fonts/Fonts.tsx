import { Global } from '@emotion/react';

// @NOTE: you can add fonts in here as necessary, see code samples at the bottom of the file:

function Fonts() {
  return (
    <Global
      styles={`
        /* Monument Extended */

        @font-face {
          font-family: 'Monument Extended Bold';
          src: url('/static/fonts/MonumentExtended/bold.woff2') format('woff2'),
                url('/static/fonts/MonumentExtended/bold.woff') format('woff');
          font-style: normal;
        }

        @font-face {
          font-family: 'Monument Extended Regular';
          src: url('/static/fonts/MonumentExtended/regular.woff2') format('woff2'),
                url('/static/fonts/MonumentExtended/regular.woff') format('woff');
          font-style: normal;
        }

        /* Roobert */

        @font-face {
          font-family: 'Roobert Regular';
          src: url('/static/fonts/Roobert/regular.woff2') format('woff2'),
               url('/static/fonts/Roobert/regular.woff') format('woff');
          font-style: normal;
          font-weight: 400;
        }
      `}
    />
  );
}
export { Fonts };
