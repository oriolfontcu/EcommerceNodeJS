import mongoose from 'mongoose';
import { IProduct } from '../interfaces/product.interface';

export interface IProductModel extends Omit<IProduct, 'id'>, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    rating: {
      rate: Number,
      count: Number,
    },
  },
  {
    timestamps: true,
  },
);

export const ProductModel = mongoose.model<IProductModel>('Product', productSchema);
