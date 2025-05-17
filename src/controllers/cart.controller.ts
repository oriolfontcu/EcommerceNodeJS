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

  updateItemQuantity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', httpStatus.UNAUTHORIZED);
      }

      if (!productId) {
        throw new AppError('Product ID is required', httpStatus.BAD_REQUEST);
      }

      if (typeof quantity !== 'number') {
        throw new AppError('Quantity must be a number', httpStatus.BAD_REQUEST);
      }

      logger.debug(`CartController: Updating quantity of product ${productId} to ${quantity} for user ${userId}`);
      const cart = await this.cartService.updateItemQuantity(userId, productId, quantity);
      logger.info(`CartController: Product quantity updated successfully`);

      res.status(httpStatus.OK).json({
        message: 'Product quantity updated successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleItemSelection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', httpStatus.UNAUTHORIZED);
      }

      if (!productId) {
        throw new AppError('Product ID is required', httpStatus.BAD_REQUEST);
      }

      logger.debug(`CartController: Toggling selection of product ${productId} for user ${userId}`);
      const cart = await this.cartService.toggleItemSelection(userId, productId);
      logger.info(`CartController: Product selection toggled successfully`);

      res.status(httpStatus.OK).json({
        message: 'Product selection toggled successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };

  processSelectedItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', httpStatus.UNAUTHORIZED);
      }

      logger.debug(`CartController: Processing selected items for user ${userId}`);
      const cart = await this.cartService.processSelectedItems(userId);
      logger.info(`CartController: Selected items processed successfully`);

      res.status(httpStatus.OK).json({
        message: 'Selected items processed successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };
}
