const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// EXPENDITURES: hurekodi matumizi halisi ya fedha kwa ombi (Request)
// maalum, dhidi ya bajeti (Budget) iliyoidhinishwa ya kategoria/mwaka
// husika wa fedha. Kila rekodi hupunguza salio la bajeti husika.
const Expenditure = sequelize.define(
  'Expenditure',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // ==========================================
    // FOREIGN KEYS
    // ==========================================

    requestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'request_id',
    },

    budgetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'budget_id',
    },

    recordedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'recorded_by_id',
    },

    // ==========================================
    // TAARIFA ZA MATUMIZI
    // ==========================================

    amount: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    expenditureDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'expenditure_date',
    },

    // ==========================================
    // USHAHIDI (RISITI/HATI) - HIARI
    // ==========================================

    receiptPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'receipt_path',
    },

    receiptName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'receipt_name',
    },
  },
  {
    tableName: 'expenditures',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Expenditure;
