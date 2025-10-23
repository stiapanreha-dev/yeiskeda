const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    validate: {
      min: -90,
      max: 90
    }
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    validate: {
      min: -180,
      max: 180
    }
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Working hours stored as JSON
  workingHours: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    field: 'working_hours'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  subscriptionTier: {
    type: DataTypes.ENUM('free', 'basic', 'premium'),
    defaultValue: 'free',
    field: 'subscription_tier'
  },
  subscriptionExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'subscription_expires_at'
  }
}, {
  tableName: 'stores',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['latitude', 'longitude']
    }
  ]
});

module.exports = Store;
