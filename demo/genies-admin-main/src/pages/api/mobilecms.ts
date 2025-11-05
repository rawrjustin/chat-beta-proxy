import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import Logger from 'shared/logger';
import cookie from 'cookie';

export interface MobileCmsData {
  guid: string;
  asset_address: string;
}

export interface MobileCmsParams {
  assetAddress: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { query } = req ?? {};
    const { assetAddress } = query;

    if (!assetAddress) {
      throw new Error('Please provide the asset address to query');
    }

    /** currently only static type assets are minted, but if in the
     *  future ugc assets are planned to be minted, we will need
     *  to check that table airtable.avatar_ugc_wearables_cms also */
    const sqlQuery = `select guid, asset_address from airtable.avatar_static_wearables_cms where asset_address = '${assetAddress}';`;

    // Instead, get the idToken from cookies
    const cookies = cookie.parse(req.headers.cookie || '');
    const idToken = cookies['id_token'] || null;

    if (!idToken) {
      throw new Error('Could not get id token from user');
    }

    const url = `${process.env.MOBILE_BACKEND_API_URL}/mobilecms?sqlQuery=${sqlQuery}`;
    const headers = {
      Authorization: `Bearer ${idToken}`,
      'x-api-key': process.env.MOBILE_BACKEND_API_KEY,
    };
    const response = await axios.get(url, {
      headers,
    });
    return res.status(200).send(response.data);
  } catch (e) {
    Logger.getInstance().error(`Query mobile cms error: ${e.message}`, {
      errorMessage: e.message,
      source: 'mobilecms',
    });
  }
  return res.status(400).send({ message: 'Could not query mobile cms' });
}
