import * as crypto from 'crypto';

function sort_obj_keys(obj: any) {
  return Object.keys(obj)
    .sort()
    .reduce((temp_obj, key) => {
      if (obj[key] instanceof Object && obj[key] instanceof Array === false) {
        obj[key] = sort_obj_keys(obj[key]);
      }
      temp_obj[key] = obj[key];
      return temp_obj;
    }, {});
}

export async function generateSignature(
  sub: string,
  query: string,
  parameterObject: any,
  nonce: number,
  operationName: string,
): Promise<string | null> {
  const secret = process.env.API_HMAC_SECRET_KEY;
  const hmac = crypto.createHmac('sha256', secret);

  const allParams = {
    operationName, // body param
    query, // body param
    [operationName]: '', // query param
    variables: parameterObject, // body param
  };

  const sortedParams = sort_obj_keys(allParams);
  const paramsString = JSON.stringify(sortedParams);

  hmac.write(`${paramsString}&x-nonce=${nonce}`);
  hmac.end(); // close the write stream

  const hash = hmac.read().toString('hex');

  return hash;
}
