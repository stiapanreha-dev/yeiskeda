const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateToken);
router.use(authorize('admin'));

// Statistics
router.get('/statistics', adminController.getStatistics);

// Stores management
router.get('/stores', adminController.getAllStoresAdmin);
router.put('/stores/:id', adminController.updateStoreAdmin);
router.delete('/stores/:id', adminController.deleteStoreAdmin);

// Customers
router.get('/customers', adminController.getAllCustomers);

// User management
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

module.exports = router;
