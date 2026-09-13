const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Request = sequelize.define(
  'Request',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // ==========================================
    // FOREIGN KEYS
    // ==========================================

    constituentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'constituent_id',
    },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
    },

    submittedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'submitted_by_id',
    },

    // ==========================================
    // REQUEST INFORMATION
    // ==========================================

    trackingNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      field: 'tracking_number',
    },

    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: DataTypes.ENUM(
        'pending',
        'in_review',
        'approved',
        'rejected',
        'completed'
      ),
      allowNull: false,
      defaultValue: 'pending',
    },

    priority: {
      type: DataTypes.ENUM(
        'low',
        'medium',
        'high',
        'urgent'
      ),
      allowNull: false,
      defaultValue: 'medium',
    },

    // ==========================================
    // DATES
    // ==========================================

    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'submitted_at',
    },

    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'resolved_at',
    },

    // ==========================================
    // IDENTIFICATION LETTER
    // ==========================================

    identificationLetterPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'identificatio_letter_path',
    },

    identificationLetterName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'identification_letter_name',
    },

    identificationLetterUploadedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'identification_letter_uploaded_at',
    },
  },
  {
    tableName: 'requests',

    timestamps: true,
  }
);

module.exports = Request;