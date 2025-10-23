const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'store_id',
    references: {
      model: 'stores',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'original_price',
    validate: {
      min: 0
    }
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'discount_price',
    validate: {
      min: 0
    }
  },
  discountPercentage: {
    type: DataTypes.VIRTUAL,
    get() {
      const original = parseFloat(this.getDataValue('originalPrice'));
      const discount = parseFloat(this.getDataValue('discountPrice'));
      if (original === 0) return 0;
      return Math.round(((original - discount) / original) * 100);
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 0
    }
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'expiry_date'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_available'
  },
  pickedUpAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'picked_up_at',
    comment: 'Timestamp when store marked item as picked up'
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    {
      fields: ['store_id']
    },
    {
      fields: ['is_available']
    },
    {
      fields: ['expiry_date']
    }
  ],
  validate: {
    // Validate that discount is at least 30%
    minimumDiscount() {
      const original = parseFloat(this.originalPrice);
      const discount = parseFloat(this.discountPrice);
      const percentage = ((original - discount) / original) * 100;

      if (percentage < 30) {
        throw new Error('Скидка должна быть минимум 30% от первоначальной цены');
      }

      if (discount >= original) {
        throw new Error('Цена со скидкой должна быть меньше обычной цены');
      }
    }
  }
});

module.exports = Product;
