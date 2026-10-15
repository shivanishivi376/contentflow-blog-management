import {
  forgotPassword,
  googleAuth,
  login,
  logout,
  refreshAuthTokens,
  resetPassword,
  signup
} from '../services/authService.js';

export const signupController = async (req, res, next) => {
  try {
    const result = await signup(req.body);

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
      data: {
        user: result.user,
        // hasInvitation: true signals that the frontend should redirect back to the
        // invitation page instead of the normal onboarding flow after login.
        hasInvitation: result.hasInvitation || false,
        invitationToken: result.invitationToken || null
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};


export const loginController = async (req, res, next) => {
  try {
    const result = await login(req.body);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const googleAuthController = async (req, res, next) => {
  try {
    const result = await googleAuth(req.body.credential);

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshController = async (req, res, next) => {
  try {
    const result = await refreshAuthTokens(req.body);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const result = await logout(req.body);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const result = await forgotPassword(req.body);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const result = await resetPassword(req.body);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
