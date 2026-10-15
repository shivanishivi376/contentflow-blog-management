import { v2 as cloudinary } from 'cloudinary';

const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    return true;
  }
  return false;
};

export const isCloudinaryConfigured = () => configureCloudinary();

export const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!configureCloudinary()) {
      return reject(new Error('Cloudinary credentials are not configured in environment variables.'));
    }

    const folder = options.folder || 'blog_uploads';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!configureCloudinary()) {
    return { result: 'skipped', reason: 'Cloudinary not configured' };
  }

  return cloudinary.uploader.destroy(publicId);
};
