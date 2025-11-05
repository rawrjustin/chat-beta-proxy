import QueryString, { stringify } from 'qs';

export const buildBase = (base: string[]) => `/${base.join('/')}`;

export const buildParams = (
  params = {},
  options: QueryString.IStringifyOptions = {
    addQueryPrefix: true,
    arrayFormat: 'comma',
    encode: false,
  },
) => {
  return stringify(params, options);
};

export const path = (baseArray: string[], params = {}) => {
  const base = buildBase(baseArray);
  const paramsStringified = buildParams(params);
  return `${base}${paramsStringified}`;
};
