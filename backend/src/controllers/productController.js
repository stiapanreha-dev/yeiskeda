const { Product, Store } = require('../models');
const { Op } = require('sequelize');

// Create product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      originalPrice,
      discountPrice,
      quantity,
      expiryDate
    } = req.body;

    // Get store for current user
    const store = await Store.findOne({ where: { userId: req.user.id } });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'У вас нет магазина. Создайте магазин сначала.'
      });
    }

    const productData = {
      storeId: store.id,
      name,
      originalPrice,
      discountPrice,
      quantity,
      expiryDate
    };

    // Add photo if uploaded
    if (req.file) {
      productData.photo = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Товар успешно добавлен',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);

    // Check for validation errors
    if (error.message.includes('Скидка должна быть')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка при создании товара',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      originalPrice,
      discountPrice,
      quantity,
      expiryDate,
      isAvailable
    } = req.body;

    // Find product and verify ownership
    const store = await Store.findOne({ where: { userId: req.user.id } });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Магазин не найден'
      });
    }

    const product = await Product.findOne({
      where: { id, storeId: store.id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    const updateData = {
      name,
      originalPrice,
      discountPrice,
      quantity,
      expiryDate,
      isAvailable
    };

    // Update photo if uploaded
    if (req.file) {
      updateData.photo = `/uploads/products/${req.file.filename}`;
    }

    await product.update(updateData);
    await product.reload(); // Перезагрузить обновленные данные

    res.json({
      success: true,
      message: 'Товар успешно обновлен',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);

    if (error.message.includes('Скидка должна быть')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении товара',
      error: error.message
    });
  }
};

// Mark product as picked up
exports.markAsPickedUp = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product and verify ownership
    const store = await Store.findOne({ where: { userId: req.user.id } });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Магазин не найден'
      });
    }

    const product = await Product.findOne({
      where: { id, storeId: store.id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    await product.update({
      isAvailable: false,
      pickedUpAt: new Date()
    });

    res.json({
      success: true,
      message: 'Товар помечен как забранный',
      data: product
    });
  } catch (error) {
    console.error('Mark as picked up error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении статуса товара',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product and verify ownership
    const store = await Store.findOne({ where: { userId: req.user.id } });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Магазин не найден'
      });
    }

    const product = await Product.findOne({
      where: { id, storeId: store.id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Товар успешно удален'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении товара',
      error: error.message
    });
  }
};

// Get all products (for feed)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        isAvailable: true,
        quantity: { [Op.gt]: 0 }
      },
      include: [
        {
          model: Store,
          as: 'store',
          where: { isActive: true }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товаров',
      error: error.message
    });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Store,
          as: 'store'
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товара',
      error: error.message
    });
  }
};
