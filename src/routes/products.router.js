import { Router } from 'express';
import productsController from '../controllers/products.controller.js';

const router = Router();

router.get('/', productsController.getProducts);

router.get('/:pid', productsController.getProductById);

router.post('/', productsController.createProduct);

router.post('/:pid/add-to-cart', productsController.addToCart);

router.delete('/:productId', productsController.deleteProduct);

export default router;
