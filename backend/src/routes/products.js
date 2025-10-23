const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const processImage = require('../middleware/imageProcessor');

// Validation
const validateProduct = [
  body('name').notEmpty().withMessage('Название обязательно'),
  body('originalPrice').isFloat({ min: 0 }).withMessage('Неверная обычная цена'),
  body('discountPrice').isFloat({ min: 0 }).withMessage('Неверная цена со скидкой'),
  body('quantity').isInt({ min: 0 }).withMessage('Неверное количество'),
  body('expiryDate').isDate().withMessage('Неверная дата окончания срока годности')
];

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Store owner routes
router.post(
  '/',
  authenticateToken,
  authorize('store'),
  upload.single('photo'),
  processImage,
  validateProduct,
  productController.createProduct
);

router.put(
  '/:id',
  authenticateToken,
  authorize('store'),
  upload.single('photo'),
  processImage,
  productController.updateProduct
);

router.patch(
  '/:id/picked-up',
  authenticateToken,
  authorize('store'),
  productController.markAsPickedUp
);

router.delete(
  '/:id',
  authenticateToken,
  authorize('store'),
  productController.deleteProduct
);

module.exports = router;
