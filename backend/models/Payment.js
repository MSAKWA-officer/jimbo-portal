const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// PAYMENTS: hatua ya mwisho ya fedha kutoka - malipo halisi kwa mlipwaji
// (mfano: mzee/mlengwa, mzabuni, taasisi) dhidi ya tumizi (Expenditure)
// lililokwisha kuidhinishwa. Expenditure moja laweza kuwa na malipo zaidi
// ya moja (kwa vipande/awamu), mradi jumla yake isivuke kiasi cha tumizi.
const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // ==========================================
    // FOREIGN KEYS
    // ==========================================

    expenditureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'expenditure_id',
    },

    recordedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'recorded_by_id',
    },

    // ==========================================
    // TAARIFA ZA MLIPWAJI
    // ==========================================

    payeeName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'payee_name',
    },

    payeePhone: {
      type: DataTypes.STRING(30),
      allowNull: true,
      field: 'payee_phone',
    },

    // ==========================================
    // TAARIFA ZA MALIPO
    // ==========================================

    amount: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
    },

    paymentMethod: {
      type: DataTypes.ENUM('cash', 'bank_transfer', 'mobile_money', 'cheque'),
      allowNull: false,
      defaultValue: 'bank_transfer',
      field: 'payment_method',
    },

    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'reference_number',
    },

    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'payment_date',
    },

    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ==========================================
    // USHAHIDI (RISITI/POP) - HIARI
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
    tableName: 'payments',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Payment;
