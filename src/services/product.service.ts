import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { AppError } from '../utils/application.error';
import { ProductRepository } from '../repositories/product.repository';
import { IProduct } from '../interfaces/product.interface';

export class ProductService {
  private readonly productRepository: ProductRepository;
  private readonly FAKE_STORE_API_URL = 'https://fakestoreapi.com/products';

  constructor() {
    this.productRepository = new ProductRepository();
  }

  private generateRandomPrice(min: number = 10, max: number = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async fetchProductsFromAPI(): Promise<IProduct[]> {
    try {
      const response = await fetch(this.FAKE_STORE_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map((product: IProduct) => ({
        title: product.title,
        price: this.generateRandomPrice(),
        description: product.description,
        category: product.category,
        image: product.image,
        rating: product.rating,
      }));
    } catch (error) {
      logger.error({ error }, 'Error fetching products from API');
      throw new AppError('Failed to fetch products from API', httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async resetProducts(): Promise<IProduct[]> {
    try {
      // Delete all existing products
      await this.productRepository.deleteAll();

      // Fetch new products from API
      const products = await this.fetchProductsFromAPI();

      // Save new products to database
      const createdProducts = await this.productRepository.createMany(products);

      logger.info('Products reset successfully');
      return createdProducts;
    } catch (error) {
      logger.error({ error }, 'Error resetting products');
      throw new AppError('Failed to reset products', httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllProducts(): Promise<IProduct[]> {
    try {
      logger.debug('ProductService: Getting all products');
      const products = await this.productRepository.getAll();
      logger.info('ProductService: Products retrieved successfully');
      return products;
    } catch (error) {
      logger.error({ error }, 'ProductService: Error getting products');
      throw error;
    }
  }

  async searchProductsByName(name: string): Promise<IProduct[]> {
    try {
      logger.debug(`ProductService: Searching products by name: ${name}`);
      const products = await this.productRepository.searchByName(name);
      logger.info(`ProductService: Found ${products.length} products matching "${name}"`);
      return products;
    } catch (error) {
      logger.error({ error }, 'ProductService: Error searching products by name');
      throw error;
    }
  }

  async getTop10Alphabetically(): Promise<IProduct[]> {
    try {
      logger.debug('ProductService: Getting top 10 products alphabetically');
      const products = await this.productRepository.getTop10Alphabetically();
      logger.info('ProductService: Top 10 products retrieved successfully');
      return products;
    } catch (error) {
      logger.error({ error }, 'ProductService: Error getting top 10 products');
      throw error;
    }
  }

  async getProductById(id: string): Promise<IProduct> {
    try {
      logger.debug(`ProductService: Getting product by ID: ${id}`);
      const product = await this.productRepository.getById(id);

      if (!product) {
        throw new AppError('Product not found', httpStatus.NOT_FOUND);
      }

      logger.info(`ProductService: Product ${id} retrieved successfully`);
      return product;
    } catch (error) {
      logger.error({ error }, 'ProductService: Error getting product by ID');
      throw error;
    }
  }
}
