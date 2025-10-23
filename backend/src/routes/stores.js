const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const storeController = require('../controllers/storeController');
const { authenticateToken, authorize, authorizeStoreAccess } = require('../middleware/auth');
const upload = require('../middleware/upload');
const processImage = require('../middleware/imageProcessor');

// Validation
const validateStore = [
  body('name').notEmpty().withMessage('Название обязательно'),
  body('address').notEmpty().withMessage('Адрес обязателен'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Неверная широта'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Неверная долгота')
];

// Public routes
router.get('/', storeController.getAllStores);
router.get('/:slug', storeController.getStoreById);

// Store owner OR admin routes
router.post(
  '/',
  authenticateToken,
  authorizeStoreAccess,
  upload.single('photo'),
  processImage,
  validateStore,
  storeController.createOrUpdateStore
);

router.put(
  '/',
  authenticateToken,
  authorizeStoreAccess,
  upload.single('photo'),
  processImage,
  storeController.createOrUpdateStore
);

router.get(
  '/my/store',
  authenticateToken,
  authorizeStoreAccess,
  storeController.getMyStore
);

router.delete(
  '/',
  authenticateToken,
  authorizeStoreAccess,
  storeController.deleteStore
);

module.exports = router;
