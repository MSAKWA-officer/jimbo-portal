const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// DOCUMENTS: barua, hati na ripoti zinazoshirikishwa kwa ajili ya approval
const Document = sequelize.define(
  'Document',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // ==========================================
    // FOREIGN KEYS
    // ==========================================

    uploadedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'uploaded_by_id',
    },

    approvedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'approved_by_id',
    },

    // ==========================================
    // TAARIFA ZA HATI
    // ==========================================

    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    documentType: {
      type: DataTypes.ENUM(
        'barua',
        'ripoti',
        'hati',
        'nyingine'
      ),
      allowNull: false,
      defaultValue: 'nyingine',
      field: 'document_type',
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ==========================================
    // FAILI LILILOPAKIWA
    // ==========================================

    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_path',
    },

    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },

    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'file_size',
    },

    // ==========================================
    // HALI YA APPROVAL
    // ==========================================

    status: {
      type: DataTypes.ENUM(
        'pending',
        'approved',
        'rejected'
      ),
      allowNull: false,
      defaultValue: 'pending',
    },

    approvalComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'approval_comment',
    },

    // ==========================================
    // TAREHE
    // ==========================================

    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'submitted_at',
    },

    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reviewed_at',
    },
  },
  {
    tableName: 'documents',
    timestamps: true,
  }
);

module.exports = Document;
