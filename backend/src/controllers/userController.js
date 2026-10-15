import { getUserProfile, updateUserPassword, updateUserProfile } from '../services/profileService.js';
import { getRecommendedBlogs } from '../services/recommendationService.js';

export const getUserProfileController = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user.id || req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: { profile },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUserProfileController = async (req, res, next) => {
  try {
    const profile = await updateUserProfile(req.user.id || req.user._id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUserPasswordController = async (req, res, next) => {
  try {
    await updateUserPassword(req.user.id || req.user._id, req.body.currentPassword, req.body.newPassword);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const getRecommendedBlogsController = async (req, res, next) => {
  try {
    const blogs = await getRecommendedBlogs(req.user);

    return res.status(200).json({
      success: true,
      message: 'Recommended blogs fetched successfully',
      data: { blogs },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
