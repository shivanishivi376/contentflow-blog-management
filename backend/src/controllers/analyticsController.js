import { getAdminOverviewAnalytics } from '../services/analyticsService.js';
import { listAllTeams, listAllUsers } from '../services/adminManagementService.js';

export const getAdminOverviewAnalyticsController = async (req, res, next) => {
  try {
    const analytics = await getAdminOverviewAnalytics();

    return res.status(200).json({
      success: true,
      message: 'Admin overview analytics fetched successfully',
      data: analytics,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const listAllUsersController = async (req, res, next) => {
  try {
    const result = await listAllUsers(req.query);

    return res.status(200).json({
      success: true,
      message: 'Users list fetched successfully',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const listAllTeamsController = async (req, res, next) => {
  try {
    const result = await listAllTeams(req.query);

    return res.status(200).json({
      success: true,
      message: 'Teams list fetched successfully',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
