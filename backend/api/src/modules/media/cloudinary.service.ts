import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiOptions, UploadApiResponse, v2 as cloudinary } from 'cloudinary';

export type StoredImage = {
  publicId: string;
  url: string;
  resourceType: string;
};

@Injectable()
export class CloudinaryService {
  private readonly folder: string;
  private readonly ready: boolean;

  constructor(private readonly config: ConfigService) {
    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME') ?? '';
    const apiKey = config.get<string>('CLOUDINARY_API_KEY') ?? '';
    const apiSecret = config.get<string>('CLOUDINARY_API_SECRET') ?? '';
    this.folder = config.get<string>('CLOUDINARY_FOLDER') ?? 'berogetai';
    this.ready = Boolean(cloudName && apiKey && apiSecret);
    if (this.ready) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    }
  }

  isConfigured() {
    return this.ready;
  }

  uploadImage(buffer: Buffer, name: string) {
    return this.upload(buffer, {
      folder: `${this.folder}/images`,
      public_id: this.safeName(name),
      resource_type: 'image',
      overwrite: false,
    });
  }

  uploadPrivate(buffer: Buffer, name: string) {
    return this.upload(buffer, {
      folder: `${this.folder}/documents`,
      public_id: this.safeName(name),
      resource_type: 'auto',
      type: 'authenticated',
      overwrite: false,
    }).then((stored) => ({ ...stored, url: this.signedUrl(stored.publicId, stored.resourceType) }));
  }

  signedUrl(publicId: string, resourceType = 'image') {
    this.assertReady();
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      type: 'authenticated',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 10 * 60,
    });
  }

  private upload(buffer: Buffer, options: UploadApiOptions): Promise<StoredImage> {
    this.assertReady();
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve(this.toStored(result));
      });
      stream.end(buffer);
    });
  }

  private toStored(result: UploadApiResponse): StoredImage {
    return { publicId: result.public_id, url: result.secure_url, resourceType: result.resource_type };
  }

  private safeName(name: string) {
    const cleaned = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `${cleaned || 'file'}-${Date.now()}`;
  }

  private assertReady() {
    if (!this.ready) throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }
}
