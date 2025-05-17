import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth.middleware';

const cartController = new CartController();
export const cartRouter = Router();

// Protected routes
cartRouter.post('/add', authenticate, cartController.addToCart);
cartRouter.get('/', authenticate, cartController.getCart);
cartRouter.delete('/:productId', authenticate, cartController.removeFromCart);
cartRouter.patch('/:productId/quantity', authenticate, cartController.updateItemQuantity);
cartRouter.patch('/:productId/select', authenticate, cartController.toggleItemSelection);
cartRouter.post('/process', authenticate, cartController.processSelectedItems);
