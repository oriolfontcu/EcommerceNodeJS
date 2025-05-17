import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { AppError } from '../utils/application.error';
import { CartRepository } from '../repositories/cart.repository';
import { ProductRepository } from '../repositories/product.repository';
import { ICart } from '../interfaces/cart.interface';

export class CartService {
  private readonly cartRepository: CartRepository;
  private readonly productRepository: ProductRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
  }

  async addToCart(userId: string, productId: string): Promise<ICart> {
    try {
      logger.debug(`CartService: Adding product ${productId} to cart for user ${userId}`);

      // Verify product exists
      const product = await this.productRepository.getById(productId);
      if (!product) {
        throw new AppError('Product not found', httpStatus.NOT_FOUND);
      }

      // Get or create cart
      let cart = await this.cartRepository.getByUserId(userId);
      if (!cart) {
        logger.debug(`CartService: Creating new cart for user ${userId}`);
        cart = await this.cartRepository.create(userId);
      }

      // Add item to cart
      const updatedCart = await this.cartRepository.addItem(cart.id!, productId);
      logger.info(`CartService: Product ${productId} added to cart successfully`);

      return updatedCart;
    } catch (error) {
      logger.error({ error }, 'CartService: Error adding product to cart');
      throw error;
    }
  }

  async getCart(userId: string): Promise<ICart> {
    try {
      logger.debug(`CartService: Getting cart for user ${userId}`);
      const cart = await this.cartRepository.getByUserId(userId);

      if (!cart) {
        logger.debug(`CartService: Creating new cart for user ${userId}`);
        return await this.cartRepository.create(userId);
      }

      return cart;
    } catch (error) {
      logger.error({ error }, 'CartService: Error getting cart');
      throw error;
    }
  }

  async removeFromCart(userId: string, productId: string): Promise<ICart> {
    try {
      logger.debug(`CartService: Removing product ${productId} from cart for user ${userId}`);

      // Verify product exists
      const product = await this.productRepository.getById(productId);
      if (!product) {
        throw new AppError('Product not found', httpStatus.NOT_FOUND);
      }

      // Get cart
      const cart = await this.cartRepository.getByUserId(userId);
      if (!cart) {
        throw new AppError('Cart not found', httpStatus.NOT_FOUND);
      }

      // Remove item from cart
      const updatedCart = await this.cartRepository.removeItem(cart.id!, productId);
      logger.info(`CartService: Product ${productId} removed from cart successfully`);

      return updatedCart;
    } catch (error) {
      logger.error({ error }, 'CartService: Error removing product from cart');
      throw error;
    }
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<ICart> {
    try {
      logger.debug(`CartService: Updating quantity of product ${productId} to ${quantity} for user ${userId}`);

      if (quantity < 0) {
        throw new AppError('Quantity cannot be negative', httpStatus.BAD_REQUEST);
      }

      // Verify product exists
      const product = await this.productRepository.getById(productId);
      if (!product) {
        throw new AppError('Product not found', httpStatus.NOT_FOUND);
      }

      // Get cart
      const cart = await this.cartRepository.getByUserId(userId);
      if (!cart) {
        throw new AppError('Cart not found', httpStatus.NOT_FOUND);
      }

      // Update item quantity
      const updatedCart = await this.cartRepository.updateItemQuantity(cart.id!, productId, quantity);
      logger.info(`CartService: Product ${productId} quantity updated successfully`);

      return updatedCart;
    } catch (error) {
      logger.error({ error }, 'CartService: Error updating product quantity');
      throw error;
    }
  }

  async toggleItemSelection(userId: string, productId: string): Promise<ICart> {
    try {
      logger.debug(`CartService: Toggling selection of product ${productId} for user ${userId}`);

      // Verify product exists
      const product = await this.productRepository.getById(productId);
      if (!product) {
        throw new AppError('Product not found', httpStatus.NOT_FOUND);
      }

      // Get cart
      const cart = await this.cartRepository.getByUserId(userId);
      if (!cart) {
        throw new AppError('Cart not found', httpStatus.NOT_FOUND);
      }

      // Toggle item selection
      const updatedCart = await this.cartRepository.toggleItemSelection(cart.id!, productId);
      logger.info(`CartService: Product ${productId} selection toggled successfully`);

      return updatedCart;
    } catch (error) {
      logger.error({ error }, 'CartService: Error toggling product selection');
      throw error;
    }
  }

  async processSelectedItems(userId: string): Promise<ICart> {
    try {
      logger.debug(`CartService: Processing selected items for user ${userId}`);

      // Get cart
      const cart = await this.cartRepository.getByUserId(userId);
      if (!cart) {
        throw new AppError('Cart not found', httpStatus.NOT_FOUND);
      }

      // Process selected items
      const updatedCart = await this.cartRepository.processSelectedItems(cart.id!);
      logger.info(`CartService: Selected items processed successfully`);

      return updatedCart;
    } catch (error) {
      logger.error({ error }, 'CartService: Error processing selected items');
      throw error;
    }
  }
}
