const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// REQUEST_APPROVALS: one row per approval step of a request.
// waiting  = earlier step not finished yet
// pending  = this is the current step, waiting for a decision
// approved / rejected = decision made
// skipped  = never reached because an earlier step was rejected
const RequestApproval = sequelize.define(
  'RequestApproval',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    requestId: { type: DataTypes.INTEGER, allowNull: false, field: 'request_id' },

    stepNumber: { type: DataTypes.INTEGER, allowNull: false, field: 'step_number' },

    stepName: { type: DataTypes.STRING(100), allowNull: false, field: 'step_name' },

    // Roles allowed to decide this step, e.g. ["officer","admin"]
    requiredRoles: { type: DataTypes.JSON, allowNull: false, field: 'required_roles' },

    status: {
      type: DataTypes.ENUM('waiting', 'pending', 'approved', 'rejected', 'skipped'),
      allowNull: false,
      defaultValue: 'waiting',
    },

    actedById: { type: DataTypes.INTEGER, allowNull: true, field: 'acted_by_id' },

    comment: { type: DataTypes.TEXT, allowNull: true },

    actedAt: { type: DataTypes.DATE, allowNull: true, field: 'acted_at' },
  },
  {
    tableName: 'request_approvals',
    timestamps: true,
    indexes: [{ unique: true, fields: ['request_id', 'step_number'] }],
  }
);

module.exports = RequestApproval;
