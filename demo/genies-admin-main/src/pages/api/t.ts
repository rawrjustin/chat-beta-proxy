import type { NextApiRequest, NextApiResponse } from 'next';
import { generateSignature } from 'src/edge/signature/generateSignature';
import { getUserFromAccessToken, getValidAccessToken } from 'src/lib/auth';

export interface SignatureRequestInput {
  operationName: string;
  variables: any;
  query: string;
  nonce: number;
}

export interface SignatureResponse {
  hash: string;
}

/**
 * This will generate an hmac signature public key for the backend to validate.
 * The backend will also cache the hash and will consider any request made within
 * 5 min from the set, to be invalid (replay attack). The backend will validate by
 * generating the public key using the shared private key + text format that
 * includes the reqeust inputs, nonce (timestamp of request), and userId.
 * @param req request object
 * @param res response object
 * @returns hashed signature, error message, or null
 */
export default async function Signature(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { body }: { body: SignatureRequestInput } = req;
    if (!body.nonce) {
      throw new Error('Missing required parameters');
    }

    const { variables, nonce, operationName, query }: SignatureRequestInput =
      body;

    if (isNaN(nonce)) {
      throw new Error('Invalid parameters');
    }

    const accessToken = await getValidAccessToken(req, res);
    if (!accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = getUserFromAccessToken(accessToken);

    const hash = await generateSignature(
      user.userId,
      query,
      variables,
      nonce,
      operationName,
    );

    const response: SignatureResponse = { hash };
    return res.status(200).send(response);
  } catch (e) {
    console.log('signature error: ', e.message);
    return res.status(500).json(e);
  }
}
