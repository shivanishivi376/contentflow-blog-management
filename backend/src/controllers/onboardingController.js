import { completeOnboarding } from '../services/onboardingService.js';

export const completeOnboardingController = async (req, res, next) => {
  try {
    const result = await completeOnboarding(req.auth.userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
