import {
  createInterest,
  deleteInterest,
  getInterestById,
  getInterests,
  updateInterest
} from '../services/interestService.js';

export const listInterestsController = async (req, res, next) => {
  try {
    const interests = await getInterests();

    return res.status(200).json({
      success: true,
      message: 'Interests fetched successfully',
      data: {
        interests
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const getInterestByIdController = async (req, res, next) => {
  try {
    const interest = await getInterestById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Interest fetched successfully',
      data: {
        interest
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const createInterestController = async (req, res, next) => {
  try {
    const interest = await createInterest(req.body);

    return res.status(201).json({
      success: true,
      message: 'Interest created successfully',
      data: {
        interest
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const updateInterestController = async (req, res, next) => {
  try {
    const interest = await updateInterest(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Interest updated successfully',
      data: {
        interest
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteInterestController = async (req, res, next) => {
  try {
    await deleteInterest(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Interest deleted successfully',
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
