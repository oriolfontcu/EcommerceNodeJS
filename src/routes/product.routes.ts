import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';

const productController = new ProductController();
export const productRouter = Router();

// Protected routes
productRouter.post('/reset', authenticate, productController.resetProducts);

// Public routes
productRouter.get('/', productController.getAllProducts);
productRouter.get('/search', productController.searchProductsByName);
productRouter.get('/top10', productController.getTop10Alphabetically);
productRouter.get('/:id', productController.getProductById);
