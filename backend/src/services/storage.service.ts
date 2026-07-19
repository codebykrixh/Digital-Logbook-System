import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { logger } from '../config/logger';

const cloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

export interface StoredFile {
  url: string;
  provider: 'cloudinary' | 'local';
}

function uploadToCloudinary(buffer: Buffer, folder: string): Promise<StoredFile> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `digilog/${folder}`, resource_type: 'auto' },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
        resolve({ url: result.secure_url, provider: 'cloudinary' });
      }
    );
    stream.end(buffer);
  });
}

async function saveLocally(
  buffer: Buffer,
  originalName: string,
  folder: string
): Promise<StoredFile> {
  const dir = path.join(UPLOAD_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });

  const safeExt = path.extname(originalName).slice(0, 10);
  const fileName = `${crypto.randomUUID()}${safeExt}`;
  fs.writeFileSync(path.join(dir, fileName), buffer);

  return { url: `/uploads/${folder}/${fileName}`, provider: 'local' };
}

/**
 * Persist an uploaded file buffer and return its public URL. Uses Cloudinary
 * when credentials are configured; otherwise falls back to local disk
 * storage served by Express, so uploads work out of the box in development.
 */
export async function storeFile(
  buffer: Buffer,
  originalName: string,
  folder: string
): Promise<StoredFile> {
  if (cloudinaryConfigured) {
    try {
      return await uploadToCloudinary(buffer, folder);
    } catch (err) {
      logger.warn(
        `Cloudinary upload failed, falling back to local storage: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }
  return saveLocally(buffer, originalName, folder);
}
