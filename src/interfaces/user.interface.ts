// Defines the structure of a User object using a TypeScript interface.
// Ensures type safety throughout the application when working with users.

export interface IUser {
  id?: string;
  email: string;
  password: string;
  passwordConfirmation?: string;
  name: string;
  surname: string;
  address: string;
  isBlocked: boolean;
  refreshToken?: string;
  isTokenValid?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
