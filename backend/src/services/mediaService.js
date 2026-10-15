import Media from '../models/Media.js';
import AppError from '../utils/AppError.js';
import { deleteFromCloudinary, isCloudinaryConfigured, uploadToCloudinary } from '../integrations/cloudinary/cloudinaryService.js';

export const uploadMediaFile = async (file, userId) => {
  if (!file) {
    throw new AppError('No file provided for upload', 400, 'FILE_REQUIRED');
  }

  let uploadResult = {};

  if (isCloudinaryConfigured()) {
    try {
      const cloudinaryResponse = await uploadToCloudinary(file.buffer, {
        folder: 'blog_platform_uploads'
      });

      uploadResult = {
        url: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
        fileType: file.mimetype,
        fileSize: file.size,
        originalName: file.originalname
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[MediaService] Cloudinary upload failed (${error.message}). Falling back to local data URI in development mode.`);
        const base64Data = file.buffer.toString('base64');
        const dataUri = `data:${file.mimetype};base64,${base64Data}`;
        const mockPublicId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        uploadResult = {
          url: dataUri,
          publicId: mockPublicId,
          fileType: file.mimetype,
          fileSize: file.size,
          originalName: file.originalname
        };
      } else {
        throw new AppError(
          `Cloudinary upload failed: ${error.message}. Please check Cloudinary credentials and permissions.`,
          502,
          'MEDIA_UPLOAD_FAILED'
        );
      }
    }
  } else {
    // Development fallback if Cloudinary credentials are not set in environment
    const base64Data = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64Data}`;
    const mockPublicId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    uploadResult = {
      url: dataUri,
      publicId: mockPublicId,
      fileType: file.mimetype,
      fileSize: file.size,
      originalName: file.originalname
    };
  }

  const mediaRecord = await Media.create({
    url: uploadResult.url,
    publicId: uploadResult.publicId,
    fileType: uploadResult.fileType,
    fileSize: uploadResult.fileSize,
    originalName: uploadResult.originalName,
    owner: userId
  });

  return mediaRecord;
};

export const deleteMediaFile = async (mediaId, userId) => {
  const media = await Media.findById(mediaId);

  if (!media) {
    throw new AppError('Media file not found', 404, 'MEDIA_NOT_FOUND');
  }

  if (String(media.owner) !== String(userId)) {
    throw new AppError('Access denied: You are not the owner of this file', 403, 'MEDIA_ACCESS_DENIED');
  }

  if (!media.publicId.startsWith('local_')) {
    try {
      await deleteFromCloudinary(media.publicId);
    } catch (error) {
      console.warn(`[MediaService] Failed to delete from Cloudinary (${error.message}). Deleting local media record.`);
    }
  }

  await Media.findByIdAndDelete(mediaId);

  return { success: true };
};
