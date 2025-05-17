// Manages HTTP requests related to authentication.
// Contains methods for handling routes like GET, POST, PUT, DELETE for users.
// Delegates business logic to the user service.

import { NextFunction, type Request, type Response } from 'express';
import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/application.error';
import { JwtPayload } from 'jsonwebtoken';

export class AuthController {
  private readonly userService: UserService;
  private readonly authService: AuthService;

  constructor() {
    this.userService = new UserService();
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug(`Controller: Received login request for email: ${req.body.email}`);
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      if (!result.id) {
        throw new AppError('User ID is missing', httpStatus.INTERNAL_SERVER_ERROR);
      }

      const response = {
        message: 'Login successful',
        data: {
          user: {
            id: result.id,
            name: result.name,
            email: result.email,
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      };
      res.send(response);
    } catch (error) {
      logger.debug({ email: req.body.email }, 'Controller: Error during login');
      if (!(error instanceof AppError)) {
        error = new AppError('Login failed', httpStatus.INTERNAL_SERVER_ERROR, {
          email: req.body.email,
          originalError: error,
        });
      }
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug(`Controller: Received registration request for email: ${req.body.email}`, { body: req.body });
    try {
      logger.debug(`User registration attempt: ${req.body.email}`);
      const user = await this.userService.create(req.body);

      logger.info('User registered successfully');
      const response = {
        message: 'User registered successfully',
        data: user,
      };
      res.status(httpStatus.CREATED).send(response);
    } catch (error) {
      logger.debug({ email: req.body.email, body: req.body }, 'Controller: Error during registration');
      if (!(error instanceof AppError)) {
        error = new AppError('Registration failed', httpStatus.INTERNAL_SERVER_ERROR, {
          email: req.body.email,
          originalError: error,
        });
      }
      next(error);
    }
  };

  refreshTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug('Controller: Received token refresh request');
    try {
      const userId = (req.user as JwtPayload)?.id;
      const refreshToken = req.headers['x-refresh-token'] as string;

      if (!userId || !refreshToken) {
        throw new AppError('Missing required tokens', httpStatus.UNAUTHORIZED);
      }

      const tokens = await this.authService.refreshTokens(userId, refreshToken);
      const response = {
        message: 'Tokens refreshed successfully',
        data: tokens,
      };
      res.send(response);
    } catch (error) {
      logger.debug('Controller: Error during token refresh');
      if (!(error instanceof AppError)) {
        error = new AppError('Token refresh failed', httpStatus.INTERNAL_SERVER_ERROR, {
          originalError: error,
        });
      }
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug('Controller: Received logout request');
    try {
      const userId = (req.user as JwtPayload)?.id;
      const refreshToken = req.headers['x-refresh-token'] as string;

      if (!userId || !refreshToken) {
        throw new AppError('Missing required tokens', httpStatus.UNAUTHORIZED);
      }

      await this.authService.logout(userId);
      const response = {
        message: 'Logout successful',
      };
      res.send(response);
    } catch (error) {
      logger.debug('Controller: Error during logout');
      if (!(error instanceof AppError)) {
        error = new AppError('Logout failed', httpStatus.INTERNAL_SERVER_ERROR, {
          originalError: error,
        });
      }
      next(error);
    }
  };
}
