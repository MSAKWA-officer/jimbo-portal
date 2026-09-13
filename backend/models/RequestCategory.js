const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// REQUEST_CATEGORIES: aina za maombi - Elimu, Afya, Miundombinu, n.k.
const RequestCategory = sequelize.define('RequestCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'request_categories',
});

module.exports = RequestCategory;
