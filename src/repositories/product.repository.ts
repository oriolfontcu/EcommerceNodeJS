import logger from '../config/logger';
import { IProductModel, ProductModel } from '../models/product.model';
import { IProduct } from '../interfaces/product.interface';
import { BaseRepository } from './base.repository';

export class ProductRepository {
  private readonly baseRepository: BaseRepository<IProductModel>;

  constructor() {
    this.baseRepository = new BaseRepository(ProductModel);
  }

  private transformId(product: IProductModel): IProduct {
    const productObj = typeof product.toObject === 'function' ? product.toObject() : product;
    const { _id, ...rest } = productObj;
    return { ...rest, id: _id.toString() };
  }

  async deleteAll(): Promise<void> {
    try {
      await ProductModel.deleteMany({});
      logger.info('All products deleted successfully');
    } catch (error) {
      logger.error({ error }, 'Error in deleteAll');
      throw error;
    }
  }

  async createMany(products: IProduct[]): Promise<IProduct[]> {
    try {
      const createdProducts = await ProductModel.insertMany(products);
      logger.info('Products created successfully');
      return createdProducts.map((product) => this.transformId(product));
    } catch (error) {
      logger.error({ error }, 'Error in createMany');
      throw error;
    }
  }

  async getAll(): Promise<IProduct[]> {
    try {
      const products = await ProductModel.find();
      return products.map((product) => this.transformId(product));
    } catch (error) {
      logger.error({ error }, 'Error in getAll');
      throw error;
    }
  }

  async searchByName(name: string): Promise<IProduct[]> {
    try {
      const products = await ProductModel.find({
        title: { $regex: name, $options: 'i' }, // Case-insensitive search
      });
      return products.map((product) => this.transformId(product));
    } catch (error) {
      logger.error({ error }, 'Error in searchByName');
      throw error;
    }
  }

  async getTop10Alphabetically(): Promise<IProduct[]> {
    try {
      const products = await ProductModel.find()
        .sort({ title: 1 }) // Sort alphabetically by title
        .limit(10); // Get only top 10
      return products.map((product) => this.transformId(product));
    } catch (error) {
      logger.error({ error }, 'Error in getTop10Alphabetically');
      throw error;
    }
  }

  async getById(id: string): Promise<IProduct | null> {
    try {
      const product = await ProductModel.findById(id);
      return product ? this.transformId(product) : null;
    } catch (error) {
      logger.error({ error }, 'Error in getById');
      throw error;
    }
  }
}
