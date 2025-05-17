import { IUser } from './user.interface';

export interface AuthUserDto extends Omit<IUser, 'password'> {
  accessToken: string;
  refreshToken: string;
}
