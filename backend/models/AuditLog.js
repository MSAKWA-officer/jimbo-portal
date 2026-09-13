const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// AUDIT_LOGS: kumbukumbu za matendo yote muhimu yanayofanywa na watumiaji
// ndani ya mfumo (kuongeza, kusasisha, kufuta, kuingia, kutoka) - hutumika
// kwa ajili ya usalama na uwazi (accountability).
const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Mtumiaji aliyefanya tendo (si lazima - baadhi ya matendo hufanywa na mfumo wenyewe)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
    },

    action: {
      type: DataTypes.ENUM('create', 'update', 'delete', 'login', 'logout'),
      allowNull: false,
    },

    // Jina la "model"/jedwali lililoguswa, mfano: 'Project', 'Request', 'Payment'
    entityType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'entity_type',
    },

    // ID ya rekodi husika iliyoguswa (si lazima kwa matendo kama login/logout)
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'entity_id',
    },

    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    // Mabadiliko ya data (mfano: {"before": {...}, "after": {...}}) - hifadhiwa kama JSON
    changes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },

    ipAddress: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'ip_address',
    },
  },
  {
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true,
    updatedAt: false, // kumbukumbu za audit hazibadilishwi kamwe baada ya kuandikwa
  }
);

module.exports = AuditLog;
