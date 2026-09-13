const { Op } = require('sequelize');
const { AuditLog, User } = require('../models');

const includeRelations = [
  { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] },
];

// GET /api/audit-logs?userId=&action=&entityType=&dateFrom=&dateTo=
exports.getAll = async (req, res) => {
  try {
    const { userId, action, entityType, dateFrom, dateTo } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(`${dateFrom}T00:00:00`);
      if (dateTo) where.createdAt[Op.lte] = new Date(`${dateTo}T23:59:59`);
    }

    const logs = await AuditLog.findAll({
      where,
      include: includeRelations,
      order: [['createdAt', 'DESC']],
      limit: 500, // "Protection against pulling too many records at once"
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve audit logs.', error: error.message });
  }
};

// GET /api/audit-logs/:id
exports.getOne = async (req, res) => {
  try {
    const log = await AuditLog.findByPk(req.params.id, { include: includeRelations });
    if (!log) return res.status(404).json({ message: 'Log not found.' });
    res.json(log);
  } catch (error) {
   res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};

// Internal helper (NOT a route) - used by other controllers to record
// an audit log entry directly, e.g.:
//   const { recordAuditLog } = require('./auditLogController');
//   await recordAuditLog({ userId: req.user?.id, action: 'update', entityType: 'Project',
//     entityId: project.id, description: 'Updated project', ipAddress: req.ip });
exports.recordAuditLog = async ({ userId, action, entityType, entityId, description, changes, ipAddress }) => {
  try {
    await AuditLog.create({
      userId: userId || null,
      action,
      entityType,
      entityId: entityId || null,
      description,
      changes: changes || null,
      ipAddress: ipAddress || null,
    });
  } catch (error) {
    // Failing to write the audit log should not stop the actual action
    console.error('Failed to write audit log:', error.message);
  }
};