const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Validation middleware
const validateRegister = [
  body('email').isEmail().withMessage('Неверный формат email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
  body('role').optional().isIn(['customer', 'store']).withMessage('Недопустимая роль')
];

const validateLogin = [
  body('email').isEmail().withMessage('Неверный формат email'),
  body('password').notEmpty().withMessage('Пароль обязателен')
];

// Routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
