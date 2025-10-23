const { User, Store, Product } = require('../models');
const { Op } = require('sequelize');

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalCustomers = await User.count({
      where: { role: 'customer' }
    });

    const totalStores = await Store.count();

    const totalProducts = await Product.count({
      where: { isAvailable: true }
    });

    const pickedUpProducts = await Product.count({
      where: { isAvailable: false, pickedUpAt: { [Op.not]: null } }
    });

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalStores,
        totalProducts,
        pickedUpProducts
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики',
      error: error.message
    });
  }
};

// Get all stores for admin
exports.getAllStoresAdmin = async (req, res) => {
  try {
    const stores = await Store.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'phoneNumber', 'createdAt']
        },
        {
          model: Product,
          as: 'products',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    console.error('Get all stores (admin) error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении списка магазинов',
      error: error.message
    });
  }
};

// Get all customers for admin
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.findAll({
      where: { role: 'customer' },
      attributes: ['id', 'email', 'phoneNumber', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении списка покупателей',
      error: error.message
    });
  }
};

// Update store by admin
exports.updateStoreAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const store = await Store.findByPk(id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Магазин не найден'
      });
    }

    await store.update(updateData);

    res.json({
      success: true,
      message: 'Магазин успешно обновлен',
      data: store
    });
  } catch (error) {
    console.error('Update store (admin) error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении магазина',
      error: error.message
    });
  }
};

// Delete store by admin
exports.deleteStoreAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Магазин не найден'
      });
    }

    await store.destroy();

    res.json({
      success: true,
      message: 'Магазин успешно удален'
    });
  } catch (error) {
    console.error('Delete store (admin) error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении магазина',
      error: error.message
    });
  }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Нельзя изменить статус администратора'
      });
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      success: true,
      message: `Пользователь ${user.isActive ? 'активирован' : 'деактивирован'}`,
      data: user.toSafeObject()
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при изменении статуса пользователя',
      error: error.message
    });
  }
};
