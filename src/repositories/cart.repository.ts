import logger from '../config/logger';
import { ICartModel, CartModel } from '../models/cart.model';
import { ICart } from '../interfaces/cart.interface';
import { BaseRepository } from './base.repository';
import mongoose from 'mongoose';

export class CartRepository {
  private readonly baseRepository: BaseRepository<ICartModel>;

  constructor() {
    this.baseRepository = new BaseRepository(CartModel);
  }

  private transformId(cart: ICartModel): ICart {
    const cartObj = typeof cart.toObject === 'function' ? cart.toObject() : cart;
    const { _id, ...rest } = cartObj;
    return { ...rest, id: _id.toString() };
  }

  async getByUserId(userId: string): Promise<ICart | null> {
    try {
      const cart = await CartModel.findOne({ userId });
      return cart ? this.transformId(cart) : null;
    } catch (error) {
      logger.error({ error }, 'Error in getByUserId');
      throw error;
    }
  }

  async create(userId: string): Promise<ICart> {
    try {
      const cart = new CartModel({ userId, items: [] });
      await cart.save();
      return this.transformId(cart);
    } catch (error) {
      logger.error({ error }, 'Error in create');
      throw error;
    }
  }

  async addItem(cartId: string, productId: string): Promise<ICart> {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }

      // Check if product already exists in cart
      const existingItem = cart.items.find((item) => item.productId.toString() === productId);

      if (existingItem) {
        // Increment quantity if product exists
        existingItem.quantity += 1;
      } else {
        // Add new item if product doesn't exist
        cart.items.push({
          productId: new mongoose.Types.ObjectId(productId),
          quantity: 1,
          selected: false,
        });
      }

      await cart.save();
      return this.transformId(cart);
    } catch (error) {
      logger.error({ error }, 'Error in addItem');
      throw error;
    }
  }

  async removeItem(cartId: string, productId: string): Promise<ICart> {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }

      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
      await cart.save();
      return this.transformId(cart);
    } catch (error) {
      logger.error({ error }, 'Error in removeItem');
      throw error;
    }
  }

  async updateItemQuantity(cartId: string, productId: string, quantity: number): Promise<ICart> {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }

      const item = cart.items.find((item) => item.productId.toString() === productId);
      if (!item) {
        throw new Error('Item not found in cart');
      }

      if (quantity <= 0) {
        // If quantity is 0 or negative, remove the item
        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
      } else {
        item.quantity = quantity;
      }

      await cart.save();
      return this.transformId(cart);
    } catch (error) {
      logger.error({ error }, 'Error in updateItemQuantity');
      throw error;
    }
  }

  async toggleItemSelection(cartId: string, productId: string): Promise<ICart> {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }

      const item = cart.items.find((item) => item.productId.toString() === productId);
      if (!item) {
        throw new Error('Item not found in cart');
      }

      item.selected = !item.selected;
      await cart.save();
      return this.transformId(cart);
    } catch (error) {
      logger.error({ error }, 'Error in toggleItemSelection');
      throw error;
    }
  }

  async processSelectedItems(cartId: string): Promise<ICart> {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }

      // Remove selected items
      cart.items = cart.items.filter((item) => !item.selected);
      await cart.save();
      return this.transformId(cart);
    } catch (error) {
      logger.error({ error }, 'Error in processSelectedItems');
      throw error;
    }
  }
}
