// Handles direct data operations related to users.
// This layer interacts with the database or a data source to perform CRUD operations.

import logger from '../config/logger';
import { IUserModel, UserModel } from '../models/user.model';
import { IUser } from '../interfaces/user.interface';
import { AuthUserDto } from '../interfaces/authUser.interface';
import { BaseRepository } from './base.repository';

export class UserRepository {
  private readonly baseRepository: BaseRepository<IUserModel>;

  constructor() {
    this.baseRepository = new BaseRepository(UserModel);
  }

  private transformId(user: IUserModel): IUser {
    const userObj = typeof user.toObject === 'function' ? user.toObject() : user;
    const { _id, ...rest } = userObj;
    return { ...rest, id: _id.toString() };
  }

  private mapProjection(projection: Record<string, boolean>): Record<string, number> {
    return Object.fromEntries(
      Object.entries(projection)
        .filter(([, value]) => value === false)
        .map(([key]) => [key, 0]),
    );
  }

  async getById(id: string, projection: Record<string, boolean> = {}): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(id, projection);
      return user ? this.transformId(user) : null;
    } catch (error) {
      logger.error({ error }, 'Error in getById');
      throw error;
    }
  }

  async getByEmail(email: string, projection: Record<string, boolean> = {}): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ email }, projection);
      return user ? this.transformId(user) : null;
    } catch (error) {
      logger.error({ error }, 'Error in getByEmail');
      throw error;
    }
  }

  async find(
    filters: Record<string, any>,
    projection: Record<string, boolean>,
    pagination: { skip: number; limit: number },
  ): Promise<IUser[]> {
    try {
      const users = await UserModel.find(filters, projection).skip(pagination.skip).limit(pagination.limit);
      return users.map((user) => this.transformId(user));
    } catch (error) {
      logger.error({ error }, 'Error in find');
      throw error;
    }
  }

  async create(data: IUser, projection: Record<string, boolean> = {}): Promise<IUser> {
    try {
      const user = new UserModel(data);
      await user.save();
      return this.transformId(user);
    } catch (error) {
      logger.error({ error }, 'Error in create');
      throw error;
    }
  }

  async update(id: string, data: Partial<IUser>, projection: Record<string, boolean> = {}): Promise<IUser | null> {
    try {
      const user = await UserModel.findByIdAndUpdate(id, data, { new: true, projection });
      return user ? this.transformId(user) : null;
    } catch (error) {
      logger.error({ error }, 'Error in update');
      throw error;
    }
  }

  async delete(id: string, projection: Record<string, boolean> = {}): Promise<IUser | null> {
    try {
      const user = await UserModel.findByIdAndDelete(id, { projection });
      return user ? this.transformId(user) : null;
    } catch (error) {
      logger.error({ error }, 'Error in delete');
      throw error;
    }
  }

  async addRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(userId, { $push: { refreshTokens: refreshToken } }, { new: true });
      logger.info('Refresh token added successfully');
    } catch (error) {
      logger.error({ error }, 'Error in addRefreshToken');
      throw error;
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(
        userId,
        {
          refreshToken,
          isTokenValid: true,
        },
        { new: true },
      );
      logger.info('Refresh token updated successfully');
    } catch (error) {
      logger.error({ error }, 'Error in updateRefreshToken');
      throw error;
    }
  }

  async invalidateToken(userId: string): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(userId, { isTokenValid: false }, { new: true });
      logger.info('Token invalidated successfully');
    } catch (error) {
      logger.error({ error }, 'Error in invalidateToken');
      throw error;
    }
  }

  async removeRefreshToken(userId: string): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(
        userId,
        {
          refreshToken: null,
          isTokenValid: false,
        },
        { new: true },
      );
      logger.info('Refresh token removed successfully');
    } catch (error) {
      logger.error({ error }, 'Error in removeRefreshToken');
      throw error;
    }
  }
}
