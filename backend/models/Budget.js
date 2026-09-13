const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// BUDGETS: bajeti iliyotengwa kwa kila kategoria ya maombi, kwa mwaka
// husika wa fedha (mfano: "2025/2026"). Hufuatilia kiasi kilichotengwa
// (allocatedAmount) dhidi ya kilichotumika (spentAmount) ili kujua salio
// linalobaki kabla ya kukubali maombi mapya ya aina hiyo.
const Budget = sequelize.define(
  'Budget',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
    },

    // Mwaka wa fedha, mfano "2025/2026"
    fiscalYear: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'fiscal_year',
    },

    allocatedAmount: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'allocated_amount',
    },

    spentAmount: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'spent_amount',
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by_id',
    },
  },
  {
    tableName: 'budgets',
    timestamps: true,
    underscored: true,
    indexes: [
      // Kategoria moja isiwe na bajeti mbili kwa mwaka mmoja wa fedha
      { unique: true, fields: ['category_id', 'fiscal_year'] },
    ],
  }
);

module.exports = Budget;