// Main router file that configures and combines all API routes.
// Includes middleware and error handling for the application.

import express, { Router } from 'express';
import { errorMiddleware } from '../middlewares/error.middleware';
import { userRouter } from './user.routes';
import { authRouter } from './auth.routes';
import { productRouter } from './product.routes';
import { cartRouter } from './cart.routes';

export const baseRouter = Router();

baseRouter.use(express.json());

baseRouter.use('/users', userRouter);
baseRouter.use('/auth', authRouter);
baseRouter.use('/products', productRouter);
baseRouter.use('/cart', cartRouter);

baseRouter.use(errorMiddleware);
