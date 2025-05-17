export interface AuthUserDto {
  id?: string;
  email: string;
  password: string;
  isBlocked?: boolean;
  authToken?: string;
  refreshToken?: string;
}
