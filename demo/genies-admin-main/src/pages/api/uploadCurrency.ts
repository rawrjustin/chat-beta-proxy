import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Logger from 'shared/logger';

const client = new S3Client({
  region: process.env.NEXT_PUBLIC_CURRENCY_BUCKET_REGION,
});
const BUCKET_NAME = process.env.NEXT_PUBLIC_CURRENCY_BUCKET_NAME;
export const URL_PREFIX = process.env.NEXT_PUBLIC_CURRENCY_URL_PREFIX;
export const KEY_PREFIX = 'currency/store_icons';
export const CURRENCY_KEY_PREFIX = 'currency/currencies';

/**
 * Convert the upload image stream to buffer
 * @param stream
 * @returns
 */
const stream2buffer = (stream: NextApiRequest): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const _buf = [];
    stream.on('data', (chunk) => _buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(_buf)));
    stream.on('error', (err) => reject(err));
  });
};

/**
 * Upload the image buffer to S3 with proper path based on type
 * @param fileBuffer uploaded file buffer
 * @param fileName file name
 * @param fileType file type
 * @param imageType the type of image (currency or product)
 * @returns the url string
 */
const uploadImageToS3 = async (
  fileBuffer: Buffer,
  fileName: string | string[],
  fileType: string | string[],
  imageType: string | string[] = 'currency',
): Promise<string> => {
  // Create file path for S3
  // Use different paths for currency vs product icons
  const folderPath =
    imageType === 'product' ? 'currency/store_icons/' : 'currency/currencies/';

  const key = `${folderPath}${fileName}`;

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: typeof fileType === 'string' ? fileType : fileType[0],
  };

  try {
    // Upload to S3
    const command = new PutObjectCommand(uploadParams);
    await client.send(command);
    return `${URL_PREFIX}/${key}`;
  } catch (e) {
    // Avoid logging the entire image buffer; only log metadata
    Logger.getInstance().error(`Upload image to S3 error: ${e.message}`, {
      bucket: uploadParams.Bucket,
      key: uploadParams.Key,
      contentType: uploadParams.ContentType,
      bodyLength: (uploadParams.Body as Buffer)?.length ?? null,
      source: 'uploadImageToS3',
    });
    throw e;
  }
};

/**
 * Handle the uploaded currency image
 * @param req
 * @param res
 */
const handleUploadImage = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Upload request received with headers:', {
    filename: req.headers['x-filename'],
    filetype: req.headers['x-filetype'],
    imageType: req.headers['x-image-type'],
  });

  const reqFileName = req.headers['x-filename'];
  const reqFileType = req.headers['x-filetype'];
  const imageType = req.headers['x-image-type'] || 'currency'; // Default to 'currency' if not specified

  if (!reqFileName) {
    console.error('Missing filename in request headers');
    return res.status(400).json({ error: 'No file name in header!' });
  }

  try {
    console.log('Converting request to buffer...');
    const fileBuffer = await stream2buffer(req);
    console.log('File buffer created, size:', fileBuffer.length);

    try {
      console.log('Uploading to S3...');
      const url = await uploadImageToS3(
        fileBuffer,
        reqFileName,
        reqFileType,
        imageType,
      );
      console.log('Upload to S3 successful, URL:', url);
      return res.status(200).json({ url });
    } catch (e) {
      console.error('S3 upload error:', e);
      Logger.getInstance().error(`Upload Image To S3 error: ${e.message}`, {
        errorMessage: e.message,
        source: 'handleUploadCurrencyImage',
      });
      return res.status(500).json({
        error: e.toString(),
        message: 'Failed to upload image to S3',
      });
    }
  } catch (e) {
    console.error('Stream to buffer error:', e);
    return res.status(500).json({
      error: e.toString(),
      message: 'Failed to process image data',
    });
  }
};

const uploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ error: 'Http method is not allowed! Only support POST!' });
  }
  // handle the currency image
  return handleUploadImage(req, res);
};

// Disable body parsing and handle as a stream
export const config = {
  api: {
    bodyParser: false,
  },
};

export default uploadHandler;
