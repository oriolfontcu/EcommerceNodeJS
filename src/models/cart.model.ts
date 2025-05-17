import mongoose from 'mongoose';
import { ICart } from '../interfaces/cart.interface';

export interface ICartModel extends Omit<ICart, 'id'>, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const CartModel = mongoose.model<ICartModel>('Cart', cartSchema);
