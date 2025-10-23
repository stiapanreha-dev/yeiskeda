const { Store, Product, User } = require('../models');
const { filterStoresByRadius } = require('../utils/geoUtils');
const { generateUniqueSlug } = require('../utils/slugify');
const { Op } = require('sequelize');

// Create or update store
exports.createOrUpdateStore = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      latitude,
      longitude,
      workingHours
    } = req.body;

    const userId = req.user.id;

    // Check if store already exists for this user
    let store = await Store.findOne({ where: { userId } });

    const storeData = {
      name,
      description,
      address,
      latitude,
      longitude,
      workingHours: typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours,
      userId
    };

    // Generate slug from name (regenerate if name changes)
    if (!store || store.name !== name) {
      storeData.slug = await generateUniqueSlug(name, Store, store?.id);
    }

    // Add photo if uploaded
    if (req.file) {
      storeData.photo = `/uploads/stores/${req.file.filename}`;
    }

    let message;

    if (store) {
      // Update existing store
      await store.update(storeData);
      await store.reload(); // Перезагрузить обновленные данные
      message = 'Магазин успешно обновлен';
    } else {
      // Create new store
      store = await Store.create(storeData);
      message = 'Магазин успешно создан';
    }

    res.status(store ? 200 : 201).json({
      success: true,
      message,
      data: store
    });
  } catch (error) {
    console.error('Create/Update store error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании/обновлении магазина',
      error: error.message
    });
  }
};

// Get all stores with products (for feed)
exports.getAllStores = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    // Find stores that have available products
    let stores = await Store.findAll({
      where: { isActive: true },
      include: [
        {
          model: Product,
          as: 'products',
          where: {
            isAvailable: true,
            quantity: { [Op.gt]: 0 }
          },
          required: true // Only include stores with available products
        }
      ]
    });

    // Filter by radius if coordinates provided
    if (latitude && longitude) {
      stores = filterStoresByRadius(
        stores,
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );
    }

    res.json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении списка магазинов',
      error: error.message
    });
  }
};

// Get single store by slug
exports.getStoreById = async (req, res) => {
  try {
    const { slug } = req.params;

    const store = await Store.findOne({
      where: { slug },
      include: [
        {
          model: Product,
          as: 'products',
          where: {
            isAvailable: true,
            quantity: { [Op.gt]: 0 }
          },
          required: false
        }
      ]
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Магазин не найден'
      });
    }

    res.json({
      success: true,
      data: store
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении магазина',
      error: error.message
    });
  }
};

// Get my store (for store owner)
exports.getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          as: 'products'
        }
      ]
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'У вас нет магазина'
      });
    }

    res.json({
      success: true,
      data: store
    });
  } catch (error) {
    console.error('Get my store error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении магазина',
      error: error.message
    });
  }
};

// Delete store (for store owner)
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { userId: req.user.id } });

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
    console.error('Delete store error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении магазина',
      error: error.message
    });
  }
};
