// Implements business logic for user operations.
// Processes requests from the controller and interacts with the repository as needed.

import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { AppError } from '../utils/application.error';
import { UserRepository } from '../repositories/user.repository';
// For PostgreSQL with Prisma uncomment the following line and comment the previous one
// import { UserRepository } from '../repositories/user.repository.prisma';
import { PasswordHelper } from '../utils/password.helper';
import { IUser } from '../interfaces/user.interface';

export class UserService {
  private readonly userRepository: UserRepository;
  private readonly defaultProjection: Record<string, boolean>;

  constructor() {
    this.userRepository = new UserRepository();
    this.defaultProjection = {
      id: true,
      name: true,
      surname: true,
      email: true,
      address: true,
      isBlocked: true,
      refreshTokens: true,
    };
  }

  private readonly normalizeUserData = (data: IUser): IUser => {
    const normalizedData = { ...data };
    if (data.name && typeof data.name === 'string') {
      normalizedData.name = data.name.trim();
    }
    if (data.surname && typeof data.surname === 'string') {
      normalizedData.surname = data.surname;
    }
    if (data.email && typeof data.email === 'string') {
      normalizedData.email = data.email.toLowerCase().trim();
    }
    if (data.password && typeof data.password === 'string') {
      normalizedData.password = data.password.trim();
    }
    logger.debug({ normalizedData }, 'Normalized user data');
    return normalizedData;
  };

  private readonly validatePassword = (password: string, passwordConfirmation: string): boolean => {
    if (password !== passwordConfirmation) {
      logger.warn('Passwords should be equal');
      throw new AppError('Passwords should match', httpStatus.BAD_REQUEST);
    }
    logger.debug('Password validated successfully');
    return true;
  };

  getById = async (id: string): Promise<IUser> => {
    const user = await this.userRepository.getById(id, this.defaultProjection);
    if (!user) {
      logger.warn(`User with id ${id} not found`);
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    logger.info(`User with id ${id} retrieved successfully`);
    return user;
  };

  getAll = (pagination: { skip: number; limit: number }): Promise<(IUser | null)[]> => {
    const MAX_LIMIT = 100;
    if (pagination.limit === 0 || pagination.limit > MAX_LIMIT) {
      pagination.limit = MAX_LIMIT;
      logger.debug('Pagination limit adjusted to MAX_LIMIT', { pagination });
    }
    const filters = {};
    logger.debug(
      `Fetching all users with filters: ${JSON.stringify(filters)} and pagination: ${JSON.stringify(pagination)}`,
    );
    return this.userRepository.find(filters, this.defaultProjection, pagination);
  };

  create = async (data: IUser): Promise<IUser> => {
    const normalizedData = this.normalizeUserData(data);
    const existingUser = await this.userRepository.getByEmail(normalizedData.email, this.defaultProjection);
    if (existingUser) {
      logger.warn(`User with email ${normalizedData.email} already exists`);
      throw new AppError('A user with this email already exists', httpStatus.CONFLICT);
    }
    if (!normalizedData.password || !normalizedData.passwordConfirmation) {
      throw new AppError('Password and password confirmation are required', httpStatus.BAD_REQUEST);
    }
    this.validatePassword(normalizedData.password, normalizedData.passwordConfirmation);
    normalizedData.password = await PasswordHelper.hashPassword(normalizedData.password);

    // Here we delete the password from the normalizedData to avoid inserting into the Database
    delete normalizedData.passwordConfirmation;
    const createdUser = await this.userRepository.create(normalizedData, this.defaultProjection);
    if (!createdUser) {
      logger.warn('User creation failed');
      throw new AppError('User creation failed', httpStatus.INTERNAL_SERVER_ERROR);
    }
    logger.info(`User created successfully with email ${normalizedData.email}`);
    return createdUser;
  };

  update = async (id: string, data: IUser): Promise<IUser> => {
    logger.debug(`Starting update for user id: ${id}`, { requestData: data });
    const userToUpdate = await this.userRepository.getById(id, this.defaultProjection);
    if (!userToUpdate) {
      logger.warn(`User with id ${id} not found for update`);
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    const normalizedData = this.normalizeUserData(data);
    if (normalizedData.email) {
      const existingUser = await this.userRepository.getByEmail(normalizedData.email, this.defaultProjection);
      if (existingUser?.id && existingUser?.id.toString() !== id) {
        logger.warn(`Another user with email ${normalizedData.email} already exists`);
        throw new AppError('A user with this email already exists', httpStatus.CONFLICT);
      }
    }
    if (!normalizedData.password || !normalizedData.passwordConfirmation) {
      throw new AppError('Password and password confirmation are required', httpStatus.BAD_REQUEST);
    }
    if (normalizedData.password) {
      this.validatePassword(normalizedData.password, normalizedData.passwordConfirmation);
      normalizedData.password = await PasswordHelper.hashPassword(normalizedData.password);
    }
    const userUpdated = await this.userRepository.update(id, normalizedData, this.defaultProjection);
    if (!userUpdated) {
      logger.warn(`User with id ${id} not found after update attempt`);
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    logger.info(`User with id ${id} updated successfully`);
    return userUpdated;
  };

  delete = async (id: string): Promise<IUser> => {
    logger.debug(`Starting deletion for user id: ${id}`);
    const userDeleted = await this.userRepository.delete(id, this.defaultProjection);
    if (!userDeleted) {
      logger.warn(`User with id ${id} not found for deletion`);
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    logger.info(`User with id ${id} deleted successfully`);
    return userDeleted;
  };
}
