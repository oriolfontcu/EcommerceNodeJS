import { NextFunction, Request, Response } from 'express';
import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { ProductService } from '../services/product.service';
import { AppError } from '../utils/application.error';

export class ProductController {
  private readonly productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  resetProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('ProductController: Resetting products');
      const products = await this.productService.resetProducts();
      logger.info('ProductController: Products reset successfully');
      res.status(httpStatus.OK).json({
        message: 'Products reset successfully',
        data: products,
      });
    } catch (error) {
      logger.error({ error }, 'Error in resetProducts controller');
      if (!(error instanceof AppError)) {
        error = new AppError('Failed to reset products', httpStatus.INTERNAL_SERVER_ERROR);
      }
      next(error);
    }
  };

  getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('ProductController: Getting all products');
      const products = await this.productService.getAllProducts();
      logger.info('ProductController: Products retrieved successfully');
      res.status(httpStatus.OK).json({
        message: 'Products retrieved successfully',
        data: products,
      });
    } catch (error) {
      logger.error({ error }, 'Error in getAllProducts controller');
      if (!(error instanceof AppError)) {
        error = new AppError('Failed to get products', httpStatus.INTERNAL_SERVER_ERROR);
      }
      next(error);
    }
  };

  searchProductsByName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.query;
      if (!name || typeof name !== 'string') {
        throw new AppError('Name parameter is required', httpStatus.BAD_REQUEST);
      }

      logger.debug(`ProductController: Searching products by name: ${name}`);
      const products = await this.productService.searchProductsByName(name);
      logger.info(`ProductController: Found ${products.length} products matching "${name}"`);

      res.status(httpStatus.OK).json({
        message: 'Products found successfully',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  getTop10Alphabetically = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('ProductController: Getting top 10 products alphabetically');
      const products = await this.productService.getTop10Alphabetically();
      logger.info('ProductController: Top 10 products retrieved successfully');

      res.status(httpStatus.OK).json({
        message: 'Top 10 products retrieved successfully',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError('Product ID is required', httpStatus.BAD_REQUEST);
      }

      logger.debug(`ProductController: Getting product by ID: ${id}`);
      const product = await this.productService.getProductById(id);
      logger.info(`ProductController: Product ${id} retrieved successfully`);

      res.status(httpStatus.OK).json({
        message: 'Product retrieved successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };
}
