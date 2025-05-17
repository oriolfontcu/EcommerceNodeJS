// Implements business logic for authorization operations.
// Processes requests from the controller and interacts with the repository as needed.

import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { AppError } from '../utils/application.error';
import { UserRepository } from '../repositories/user.repository';
// For PostgreSQL with Prisma uncomment the following line and comment the previous one
// import { UserRepository } from '../repositories/user.repository.prisma';
import { PasswordHelper } from '../utils/password.helper';
import { TokenHelper } from '../utils/token.helper';
import { AuthUserDto } from '../interfaces/authUser.interface';

export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly defaultProjection: Record<string, boolean>;

  constructor() {
    this.userRepository = new UserRepository();
    this.defaultProjection = {
      id: true,
      name: true,
      email: true,
      isBlocked: true,
      refreshToken: true,
    };
  }

  login = async (email: string, password: string): Promise<AuthUserDto> => {
    logger.debug(`AuthService: Attempting login for email: ${email}`);
    const projection = { ...this.defaultProjection, password: true };
    const user = await this.userRepository.getByEmail(email, projection);

    if (!user) {
      logger.warn(`AuthService: User not found for email: ${email}`);
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    if (user.isBlocked) {
      logger.warn(`AuthService: User with email ${email} is blocked`);
      throw new AppError('User is blocked', httpStatus.FORBIDDEN);
    }

    const isPasswordValid = await PasswordHelper.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`AuthService: Invalid password for email: ${email}`);
      throw new AppError('Invalid password', httpStatus.UNAUTHORIZED);
    }

    if (!user.id) {
      throw new AppError('User ID is missing', httpStatus.INTERNAL_SERVER_ERROR);
    }

    // Generate tokens
    const accessToken = TokenHelper.generateToken({ payload: { id: user.id }, expires: 'auth' });
    const refreshToken = TokenHelper.generateToken({ payload: { id: user.id }, expires: 'refresh' });

    // Store refresh token in database
    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    // Create response object without password
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`AuthService: Login successful for email: ${email}`);
    return {
      ...userWithoutPassword,
      accessToken,
      refreshToken,
    };
  };

  refreshTokens = async (
    userId: string,
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    logger.debug(`AuthService: Attempting to refresh tokens for user: ${userId}`);

    const user = await this.userRepository.getById(userId);
    if (!user) {
      logger.warn(`AuthService: User not found for id: ${userId}`);
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    if (user.isBlocked) {
      logger.warn(`AuthService: User with id ${userId} is blocked`);
      throw new AppError('User is blocked', httpStatus.FORBIDDEN);
    }

    // Verify that the old refresh token matches the one in the database
    if (!user.refreshToken || user.refreshToken !== oldRefreshToken) {
      logger.warn(`AuthService: Invalid refresh token for user: ${userId}`);
      throw new AppError('Invalid refresh token', httpStatus.UNAUTHORIZED);
    }

    // Generate new tokens
    const newAccessToken = TokenHelper.generateToken({ payload: { id: userId }, expires: 'auth' });
    const newRefreshToken = TokenHelper.generateToken({ payload: { id: userId }, expires: 'refresh' });

    // Update refresh token in database
    await this.userRepository.updateRefreshToken(userId, newRefreshToken);

    logger.info(`AuthService: Tokens refreshed successfully for user: ${userId}`);
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  };

  logout = async (userId: string): Promise<void> => {
    logger.debug(`AuthService: Attempting logout for user: ${userId}`);
    await this.userRepository.invalidateToken(userId);
    logger.info(`AuthService: Logout successful for user: ${userId}`);
  };
}
