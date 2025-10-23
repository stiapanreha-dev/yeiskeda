const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration object for sequelize-cli
const config = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'food_discount_db',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
};

// Sequelize instance for application use
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
  } catch (error) {
    console.error('✗ Unable to connect to database:', error.message);
    process.exit(1);
  }
};

// Export both:
// - sequelize instance for app
// - config object for sequelize-cli
module.exports = {
  sequelize,
  testConnection,
  development: config,
  production: config,
  test: config
};
