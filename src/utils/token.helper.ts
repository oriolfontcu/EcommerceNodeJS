// Utility functions for handling token-related operations.
// Includes functionalities like generating, verifying, and decoding JSON Web Tokens (JWT).
// Ensures secure and consistent token management throughout the application.

import jwt, { JwtPayload } from 'jsonwebtoken';
import { SECRET_KEY } from '../config/config';
import { httpStatus } from '../config/httpStatusCodes';
import { AppError } from './application.error';
import logger from '../config/logger';

interface IToken {
  payload: object;
  expires: 'auth' | 'refresh';
}

// TODO: Demanar a Oriol com gestion es tokens

export class TokenHelper {
  static readonly generateToken = ({ payload, expires }: IToken): string => {
    logger.debug('TokenHelper: Generating token', { payloadSummary: Object.keys(payload) });

    const options: jwt.SignOptions = {
      expiresIn: expires === 'auth' ? '5000s' : '24h',
    };
    if (!SECRET_KEY) {
      logger.error('TokenHelper: SECRET_KEY is not defined');
      throw new AppError('SECRET_KEY is not defined', httpStatus.INTERNAL_SERVER_ERROR);
    }

    const token = jwt.sign(payload, SECRET_KEY, options);
    logger.debug('TokenHelper: Token generated successfully');
    return token;
  };

  static readonly verifyToken = (token: string): string | JwtPayload => {
    logger.debug('TokenHelper: Verifying token');

    if (!SECRET_KEY) {
      logger.error('TokenHelper: SECRET_KEY is not defined');
      throw new AppError('SECRET_KEY is not defined', httpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      logger.debug('TokenHelper: Token verified successfully');
      return decoded;
    } catch (error) {
      logger.error({ error: error.message }, 'TokenHelper: Token verification failed');
      throw new AppError('Invalid token', httpStatus.UNAUTHORIZED);
    }
  };
}
