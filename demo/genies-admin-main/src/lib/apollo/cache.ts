import { InMemoryCache } from '@apollo/client';

// @NOTE: to generate mocks from the latest schema, run `npm run schema:download`

// @NOTE: if a field does not exist in the schema, extend it from its parent
// type in `src/lib/apollo/schema-local.graphql`

export const createCache = (opts = {}) =>
  new InMemoryCache({
    typePolicies: {
      // @EXAMPLE:
      //
      // EditionMetadata: {
      //   fields: {
      //     images() {
      //       return [
      //         {
      //           type: 'EDITION_IMAGE_TYPE_HERO',
      //           url: `/mocks/${randomize([
      //             'monkeyhead',
      //             'dress - 01',
      //             'elephant',
      //             'glasses - 04',
      //             'hat - 05',
      //             'hoodie - 04',
      //             'jacket - 04',
      //             'pants - 02',
      //             'shirt - 09',
      //             'shoes - 08',
      //             'shorts - 15',
      //             'skirt - 05',
      //           ])}.png`,
      //         },
      //         {
      //           type: 'EDITION_IMAGE_TYPE_MANNEQUIN_FULL',
      //           url: '/mocks/mannequin_one.png',
      //         },
      //         {
      //           type: 'EDITION_IMAGE_TYPE_MANNEQUIN_FULL',
      //           url: '/mocks/mannequin_two.png',
      //         },
      //         {
      //           type: 'EDITION_IMAGE_TYPE_CONTAINER',
      //           url: `/mocks/${randomize([
      //             'sloth',
      //             'devil',
      //             'elephant',
      //             'hypno',
      //           ])}-packaging.png`,
      //         },
      //       ];
      //     },
      //   },
      // },
    },
    ...opts,
  });
