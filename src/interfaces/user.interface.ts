// Defines the structure of a User object using a TypeScript interface.
// Ensures type safety throughout the application when working with users.

export interface IUser {
  id?: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  passwordConfirmation?: string; // TODO: Demanar a Oriol si aixi està bé o podria fallar
  address: string;
  createdAt?: Date;
  updatedAt?: Date;
  authToken?: string;
  refreshToken?: string;
}
