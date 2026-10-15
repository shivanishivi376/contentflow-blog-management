import { listExternalPublications, publishToDevTo } from '../services/publishingService.js';

export const publishToDevToController = async (req, res, next) => {
  try {
    const publication = await publishToDevTo(req.params.id, req.user, {
      tags: req.body?.tags
    });

    return res.status(201).json({
      success: true,
      message: 'Article successfully cross-posted to Dev.to',
      data: { publication },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const listExternalPublicationsController = async (req, res, next) => {
  try {
    const publications = await listExternalPublications(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'External publications fetched successfully',
      data: { publications },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
