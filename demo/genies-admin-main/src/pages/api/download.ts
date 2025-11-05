import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.GAP_BUCKET_REGION!;
const BUCKET_NAME = process.env.GAP_BUCKET_NAME!;

const s3 = new S3Client({ region: REGION });

/**
 * Generate a signed URL for downloading an S3 object
 */
const getSignedDownloadUrl = async (key: string, expiresIn = 60 * 5) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  const signedUrl = await getSignedUrl(s3, command, { expiresIn });
  return signedUrl;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const fileUrl = req.query.url as string;
  if (!fileUrl) {
    return res.status(400).json({ error: 'Missing ?url parameter.' });
  }

  try {
    const signedUrl = await getSignedDownloadUrl(fileUrl);
    return res.status(200).json({ signedUrl });
  } catch (err: any) {
    console.error('Error generating signed download URL:', err);
    return res.status(500).json({ error: err.message });
  }
}
