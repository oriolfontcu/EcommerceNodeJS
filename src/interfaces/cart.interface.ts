import mongoose from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface ICart {
  id?: string;
  userId: string;
  items: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}
