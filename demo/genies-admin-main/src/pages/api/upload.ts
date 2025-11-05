import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Logger from 'shared/logger';
import fs from 'fs';
import decompress from 'decompress';
import crypto from 'crypto';

const client = new S3Client({ region: process.env.BUCKET_REGION });
const BUCKET_NAME = process.env.BUCKET_NAME;
const URL_PREFIX = process.env.URL_PREFIX;
const KEY_PREFIX = 'drops';
const ZIP_FILE_TYPE = 'application/zip';
const ZIP_FILE_TEMP_DIR = './zip_temp_dir';

/**
 * Convert the upload image stream to buffer
 * @param stream
 * @returns
 */
const stream2buffer = (stream: NextApiRequest) => {
  return new Promise((resolve, reject) => {
    const _buf = [];
    stream.on('data', (chunk) => _buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(_buf)));
    stream.on('error', (err) => reject(err));
  });
};

/**
 * Handle upload single drop image to S3
 * @param buffer image buffer
 * @param name
 * @param type
 * @returns
 */
const uploadImageToS3 = async (buffer, name, type = null) => {
  let fileType;
  if (!type) {
    const dotIdx = name.lastIndexOf('.');
    if (dotIdx < 0) throw new Error('No type in the file name!');
    fileType = name.substr(dotIdx + 1);
  } else {
    fileType = type;
  }
  const key = `${KEY_PREFIX}/${name}`;
  const putCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/' + fileType,
  });
  const putRes = await client.send(putCommand);
  if (putRes?.$metadata?.httpStatusCode !== 200) {
    throw new Error(`Fail to upload image: ${name}`);
  }
  return `${URL_PREFIX}/${key}`;
};

/**
 * Handle the uploaded drop image
 * @param req
 * @param res
 */
const handleUploadDropImage = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const reqFileName = req.headers['x-filename'];
  const reqFileType = req.headers['x-filetype'];
  if (!reqFileName) {
    res.status(400).json({ error: 'No file name in header!' });
  }
  const fileBuffer = await stream2buffer(req);
  try {
    const url = await uploadImageToS3(fileBuffer, reqFileName, reqFileType);
    return res.status(200).json({ url });
  } catch (e) {
    Logger.getInstance().error(`Upload Image To S3 error: ${e.message}`, {
      errorMessage: e.message,
      source: 'handleUploadDropImage',
    });
    return res.status(500).json({ error: e.toString() });
  }
};

/**
 * Write the uploaded zip file stream to a local file
 * @param stream
 * @param filePath
 */
const stream2File = async (stream: NextApiRequest, filePath: string) => {
  const createFileStream = fs.createWriteStream(filePath);
  if (!fs.existsSync(ZIP_FILE_TEMP_DIR)) {
    fs.mkdirSync(ZIP_FILE_TEMP_DIR);
  }
  await new Promise((resolve, reject) => {
    stream
      .pipe(createFileStream)
      .on('error', (err) => {
        return reject(err);
      })
      .on('close', () => {
        return resolve(true);
      });
  });
};

/**
 * Clear local file directory
 * @param dir the directory path
 */
const clearDirectory = (dir: string) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const path = `${dir}/${file}`;
    if (fs.lstatSync(path).isDirectory()) {
      clearDirectory(path);
      fs.rmdirSync(path);
    } else {
      fs.rmSync(path);
    }
  }
  fs.rmdirSync(dir);
};

/**
 * clear  the zip file and the unzipped files if ther exist.
 */
const clearZipfile = (zipFilePath: string, destUnzippedDir: string) => {
  if (fs.existsSync(zipFilePath)) {
    fs.rmSync(zipFilePath);
  }
  if (fs.existsSync(destUnzippedDir)) {
    clearDirectory(destUnzippedDir);
  }
};

/**
 * Upload unzipped image files to S3 bucket
 * @param dir
 * @returns
 */
const uploadUnzippedImageDirToS3 = async (dir: string, prefix: string) => {
  const filenames = fs.readdirSync(dir);

  const uploadingPromises = filenames.map((file) => {
    // get file type
    const dotIdx = file.lastIndexOf('.');
    if (dotIdx < 0) throw new Error('No type in the file name!');
    const fileType = file.substring(dotIdx + 1);
    const readStream = fs.createReadStream(`${dir}/${file}`);
    // save to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${prefix}/${file}`,
      Body: readStream,
      ContentType: 'image/' + fileType,
    });
    return client.send(command);
  });
  const allRes = await Promise.all(uploadingPromises);
  let hasError = false;
  const urlList = allRes.map((res, idx) => {
    if (res?.$metadata?.httpStatusCode === 200) {
      return `${URL_PREFIX}/${prefix}/${filenames[idx]}`;
    } else {
      if (!hasError) {
        hasError = true;
      }
      return null;
    }
  });
  if (hasError) throw new Error('Upload single image fails');
  return urlList;
};

/**
 * Handle the uploaded edition images asset (zip file)
 * @param req
 * @param res
 * @returns
 */
const handleUploadZipFile = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const reqFileName = Array.isArray(req.headers['x-filename'])
    ? req.headers['x-filename'][0]
    : req.headers['x-filename'];
  if (!reqFileName) {
    return res.status(400).json({ error: 'No file name in header!' });
  }
  if (reqFileName.indexOf('.zip') < 0) {
    return res.status(400).json({ error: 'Not a valid file type!' });
  }
  const reqGuid = Array.isArray(req.headers['x-guid'])
    ? req.headers['x-guid'][0]
    : req.headers['x-guid'];
  if (!reqGuid) {
    return res.status(400).json({ error: 'No guid is provided!' });
  }
  const randomStr = crypto.randomBytes(20).toString('hex');
  const tempFilePath = `${ZIP_FILE_TEMP_DIR}/${randomStr}.zip`;
  const destUnzippedDir = `${ZIP_FILE_TEMP_DIR}/${randomStr}`;
  try {
    // Receive file from browser
    await stream2File(req, tempFilePath);
    // Unzip file
    await decompress(tempFilePath, destUnzippedDir);
    // upload to S3 and use reqGuid as the asset prefix
    const urlList = await uploadUnzippedImageDirToS3(destUnzippedDir, reqGuid);
    // Only clear the unzipped local directory
    clearDirectory(destUnzippedDir);
    fs.rmSync(tempFilePath);
    return res.status(200).json(urlList);
  } catch (e) {
    // clear the file if there is any error
    clearZipfile(tempFilePath, destUnzippedDir);
    Logger.getInstance().error(`Upload Image Asset To S3 error: ${e.message}`, {
      errorMessage: e.message,
      source: 'handleUploadZipFile',
    });
    return res.status(500).json({ error: e.toString() });
  }
};

const uploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ error: 'Http method is not allowed! Only support POST!' });
  }
  const reqFileType = req.headers['x-filetype'];

  if (reqFileType === ZIP_FILE_TYPE) {
    // handle the zip file
    return handleUploadZipFile(req, res);
  } else {
    // handle the drop image
    return handleUploadDropImage(req, res);
  }
};

// Disable body parsing and handle as a stream
export const config = {
  api: {
    bodyParser: false,
  },
};

export default uploadHandler;
