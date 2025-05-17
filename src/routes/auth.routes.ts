// Defines the routes for authentication-related operations.
// Maps HTTP methods and endpoints to the corresponding controller methods.

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { UserValidator } from '../validators/user.validator';
import { AuthValidator } from '../validators/auth.validator';
import { validate, ValidationSource } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const authController = new AuthController();
export const authRouter = Router();

// Public routes
authRouter.post('/register', validate(UserValidator.userCreateSchema, ValidationSource.BODY), authController.register);
authRouter.post('/login', validate(AuthValidator.loginSchema, ValidationSource.BODY), authController.login);

// Protected routes
authRouter.post('/refresh', authenticate, authController.refreshTokens);
authRouter.post('/logout', authenticate, authController.logout);
