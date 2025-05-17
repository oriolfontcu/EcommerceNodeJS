import { Request, Response, NextFunction } from 'express';
import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { CartService } from '../services/cart.service';
import { AppError } from '../utils/application.error';

export class CartController {
  private readonly cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', httpStatus.UNAUTHORIZED);
      }

      if (!productId) {
        throw new AppError('Product ID is required', httpStatus.BAD_REQUEST);
      }

      logger.debug(`CartController: Adding product ${productId} to cart for user ${userId}`);
      const cart = await this.cartService.addToCart(userId, productId);
      logger.info(`CartController: Product added to cart successfully`);

      res.status(httpStatus.OK).json({
        message: 'Product added to cart successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };

  getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', httpStatus.UNAUTHORIZED);
      }

      logger.debug(`CartController: Getting cart for user ${userId}`);
      const cart = await this.cartService.getCart(userId);
      logger.info(`CartController: Cart retrieved successfully`);

      res.status(httpStatus.OK).json({
        message: 'Cart retrieved successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };

  removeFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', httpStatus.UNAUTHORIZED);
      }

      if (!productId) {
        throw new AppError('Product ID is required', httpStatus.BAD_REQUEST);
      }

      logger.debug(`CartController: Removing product ${productId} from cart for user ${userId}`);
      const cart = await this.cartService.removeFromCart(userId, productId);
      logger.info(`CartController: Product removed from cart successfully`);

      res.status(httpStatus.OK).json({
        message: 'Product removed from cart successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };
}
