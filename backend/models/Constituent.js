const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// CONSTITUENTS: wananchi/watu wanaowasilisha maombi
const Constituent = sequelize.define('Constituent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Endapo profile hii ni ya mwananchi mwenye akaunti ya 'citizen' aliyejiongeza
  // mwenyewe, hii inaunganisha na akaunti yake (Users). Ni null kwa constituents
  // walioandikishwa na ofisi (staff/secretary) ambao hawana akaunti ya login.
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
    field: 'user_id',
  },
  fullName: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('me', 'ke'),
    allowNull: true,
  },
  nationalId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: { isEmail: true },
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  ward: {
    type: DataTypes.STRING(100), // kata
    allowNull: true,
  },
  village: {
    type: DataTypes.STRING(100), // kijiji/mtaa
    allowNull: true,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'constituents',
});

module.exports = Constituent;
