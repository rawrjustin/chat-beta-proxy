import type { NextApiRequest, NextApiResponse } from 'next';
import { encodeBase64 } from 'shared/encoding';
import Logger from 'shared/logger';
import { getValidAccessToken } from 'src/lib/auth';

export default async function GetClientHash(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const accessToken = await getValidAccessToken(req, res);
    if (!accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { query } = req;

    if (query?.clientId == null) {
      throw Error('Missing query params');
    }

    const { clientId } = query;

    const hash = encodeBase64(`${clientId}_${process.env.WEB_CLIENT_SECRET}`);
    return res.status(200).send({ hash });
  } catch (e) {
    Logger.getInstance().error(`GetClientHash failed ${e.message}`, {
      errorMessage: e.message,
      source: 'api/client',
    });

    if (e === 'The user is not authenticated') {
      return res.status(200).send(null);
    }

    return res.status(500).json(e);
  }
}
