const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// NOTIFICATIONS: arifa zinazotumwa kwa watumiaji wa mfumo (mtu mmoja mmoja).
// Kila arifa "inamilikiwa" na mtumiaji mmoja (userId) ili hali ya
// "imesomwa/haijasomwa" iwe sahihi kwa kila mtu - hata kama arifa
// ile ile ilitumwa kwa watu wengi kwa pamoja (broadcast).
const Notification = sequelize.define(
  'Notification',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Mtumiaji anayepokea/anayemiliki arifa hii
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },

    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // Aina ya arifa - hutumika kuchagua rangi/icon upande wa frontend
    type: {
      type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
      allowNull: false,
      defaultValue: 'info',
    },

    // Njia (path) ya ndani ya mfumo inayohusiana na arifa, mfano:
    // '/requests/12' - ili mtumiaji aweze kubofya na kwenda moja kwa moja
    link: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read',
    },

    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at',
    },

    // Mtumiaji aliyeituma arifa hii (si lazima - arifa zaweza kutumwa na mfumo wenyewe)
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by_id',
    },
  },
  {
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Notification;
