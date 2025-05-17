// Middleware for handling authentication and authorization.
// Includes functionality for validating tokens, ensuring protected routes, and managing user roles and permissions to restrict access as needed.

import { Request, Response, NextFunction } from 'express';
import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { TokenHelper } from '../utils/token.helper';
import { AppError } from '../utils/application.error';
import { UserRepository } from '../repositories/user.repository';
import { JwtPayload } from 'jsonwebtoken';

const userRepository = new UserRepository();

export const checkToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.debug('checkToken middleware: Received authentication request', { path: req.path, method: req.method });

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    logger.warn('checkToken middleware: No token provided');
    next(new AppError('You must be logged in to access this resource.', httpStatus.UNAUTHORIZED));
    return;
  }
  try {
    const decoded = TokenHelper.verifyToken(token);
    req.body.user = decoded;
    logger.info('checkToken middleware: Token verified successfully');
    next();
  } catch (error) {
    logger.warn('checkToken middleware: Invalid token', { error: error.message });
    next(new AppError('Invalid token.', httpStatus.UNAUTHORIZED));
  }
};

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const refreshToken = req.headers['x-refresh-token'] as string;

    if (!authHeader || !refreshToken) {
      throw new AppError('Missing authentication tokens', httpStatus.UNAUTHORIZED);
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      throw new AppError('Invalid authorization header format', httpStatus.UNAUTHORIZED);
    }

    let decoded: JwtPayload;
    try {
      // Try to verify the access token
      decoded = TokenHelper.verifyToken(accessToken);

      // Verify that the user's token is still valid
      const user = await userRepository.getById(decoded.id as string);
      if (!user || !user.isTokenValid) {
        throw new AppError('Token has been invalidated', httpStatus.UNAUTHORIZED);
      }

      req.user = decoded;
      next();
      return;
    } catch (error) {
      // If token is malformed or invalid, try to refresh
      logger.debug('Access token invalid, attempting refresh');
    }

    try {
      // Verify refresh token
      const refreshDecoded = TokenHelper.verifyToken(refreshToken);
      const userId = refreshDecoded.id as string;

      // Get user and verify refresh token
      const user = await userRepository.getById(userId);
      if (!user) {
        throw new AppError('User not found', httpStatus.NOT_FOUND);
      }

      // Verify that the refresh token matches the one in the database and is valid
      if (!user.refreshToken || user.refreshToken !== refreshToken || !user.isTokenValid) {
        throw new AppError('Invalid refresh token', httpStatus.UNAUTHORIZED);
      }

      // Generate new tokens
      const newAccessToken = TokenHelper.generateToken({ payload: { id: userId }, expires: 'auth' });
      const newRefreshToken = TokenHelper.generateToken({ payload: { id: userId }, expires: 'refresh' });

      // Update refresh token in database
      await userRepository.updateRefreshToken(userId, newRefreshToken);

      // Set new tokens in response headers
      res.setHeader('x-access-token', newAccessToken);
      res.setHeader('x-refresh-token', newRefreshToken);

      // Set user in request
      req.user = { id: userId } as JwtPayload;

      // Store the original response.json method
      const originalJson = res.json;

      // Override the response.json method to include the new tokens
      res.json = function (body) {
        const responseBody = {
          ...body,
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
        };
        return originalJson.call(this, responseBody);
      };

      next();
    } catch (refreshError) {
      logger.error({ error: refreshError }, 'Refresh token validation failed');
      throw new AppError('Invalid refresh token', httpStatus.UNAUTHORIZED);
    }
  } catch (error) {
    next(error);
  }
};
