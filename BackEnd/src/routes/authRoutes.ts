import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as authController from '../controllers/authController';

export const authRoutes = Router();

authRoutes.post('/register', asyncHandler(authController.register));
authRoutes.post('/login', asyncHandler(authController.login));

