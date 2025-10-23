const User = require('./User');
const Store = require('./Store');
const Product = require('./Product');

// Define relationships
// User -> Store (one-to-one)
User.hasOne(Store, {
  foreignKey: 'userId',
  as: 'store',
  onDelete: 'CASCADE'
});

Store.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Store -> Products (one-to-many)
Store.hasMany(Product, {
  foreignKey: 'storeId',
  as: 'products',
  onDelete: 'CASCADE'
});

Product.belongsTo(Store, {
  foreignKey: 'storeId',
  as: 'store'
});

module.exports = {
  User,
  Store,
  Product
};
