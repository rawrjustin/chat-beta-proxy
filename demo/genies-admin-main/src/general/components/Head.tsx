import NextHead from 'next/head';
import PropTypes from 'prop-types';

interface HeadProps {
  title: string;
  subtitle: string;
  pageKeywords?: string;
  description?: string;
}

const DEFAULT_DESCRIPTION =
  'As the leading avatar technology company, Genies has created the most intelligent and dynamic avatars on the market. Genies are used by celebrities, tastemakers, and influencers. Genies offers exclusive digital goods and a cavatar SDK.';

const DEFAULT_KEYWORDS =
  'Genies, Genies Warehouse, Genies Marketplace, Flow Marketplace, avatar, NFT, avatar NFT';

const Head = (props: HeadProps) => {
  const subtitle = props.subtitle ? `${props.subtitle} - ` : '';
  const title = `${subtitle}${props.title}`;
  const keywords = props.pageKeywords
    ? `${props.pageKeywords}, ${DEFAULT_KEYWORDS}`
    : DEFAULT_KEYWORDS;
  const description = props.description || DEFAULT_DESCRIPTION;

  return (
    <NextHead>
      <title>{title}</title>
      <link rel="icon" href="/favicon/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicon/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/favicon/safari-pinned-tab.svg"
        color="#5bbad5"
      />
      <meta name="keywords" content={keywords} />
      <meta name="description" content={description} />
      <meta name="msapplication-TileColor" content="#ffffff" />
      {/* a suggested color that user agents should use to customize 
      the display of the page or of the surrounding user interface.*/}
      <meta name="theme-color" content="#ffffff" />
    </NextHead>
  );
};

Head.defaultProps = {
  title: 'Genies Admin',
  subtitle: '',
};

Head.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

export default Head;
