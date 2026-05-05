import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as campaignController from '../controllers/campaignController';
import { authMiddleware } from '../middlewares/authMiddleware';

export const campaignRoutes = Router();

// All campaign endpoints are scoped to the authenticated user (no public campaign access).
campaignRoutes.use(authMiddleware);

campaignRoutes.get('/', asyncHandler(campaignController.list));
campaignRoutes.post('/', asyncHandler(campaignController.create));
campaignRoutes.get('/:id', asyncHandler(campaignController.details));
campaignRoutes.patch('/:id', asyncHandler(campaignController.update));
campaignRoutes.delete('/:id', asyncHandler(campaignController.remove));
campaignRoutes.post('/:id/schedule', asyncHandler(campaignController.schedule));
campaignRoutes.post('/:id/send', asyncHandler(campaignController.send));
campaignRoutes.get('/:id/stats', asyncHandler(campaignController.stats));

