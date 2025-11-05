import Document, { Html, Head, Main, NextScript } from 'next/document';
// import { v4 as uuidv4 } from "uuid";
// eslint-disable-next-line no-restricted-imports
import { ColorModeScript } from '@chakra-ui/react';
import { theme } from 'src/theme';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* <meta property="csp-nonce" content={nonce} /> */}
          {/* <meta httpEquiv="Content-Security-Policy" content={csp} /> */}
          {/* <meta name="referrer" content="strict-origin" /> */}
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
