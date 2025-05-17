// Defines Joi schemas for validating user-related requests.
// Ensures that incoming data adheres to the required structure and rules.

import Joi from 'joi';

export class UserValidator {
  private static readonly id = Joi.string();
  private static readonly email = Joi.string().email();
  private static readonly password = Joi.string()
    .min(3)
    .regex(/^(?=.*[A-Z])(?=.*[a-z]).{5,}$/)
    .message('Password should have at least 5 characters, at least one uppercase and one lowercase');
  private static readonly name = Joi.string()
    .regex(/^[\p{L}]+$/u)
    .message('Name should only contain letters');
  private static readonly surname = Joi.string()
    .regex(/^[\p{L}]+$/u)
    .message('Surname should only contain letters');
  private static readonly address = Joi.string();

  static readonly userIdSchema = Joi.object({ id: UserValidator.id.required() });

  static readonly userCreateSchema = Joi.object({
    email: UserValidator.email.required(),
    password: UserValidator.password.required(),
    passwordConfirmation: UserValidator.password.required(),
    name: UserValidator.name.required(),
    surname: UserValidator.surname.required(),
    address: UserValidator.address.required(),
  });

  static readonly userUpdateSchema = Joi.object({
    name: UserValidator.name,
    email: UserValidator.email,
    password: UserValidator.password,
  });
}
