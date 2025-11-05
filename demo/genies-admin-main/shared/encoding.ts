import { Buffer } from 'buffer';

export const decodeBase64 = (str: string): string =>
  Buffer.from(str, 'base64').toString('binary');
export const encodeBase64 = (str: string): string =>
  Buffer.from(str, 'binary').toString('base64');
