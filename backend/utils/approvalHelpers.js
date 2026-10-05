const { Op } = require('sequelize');
const { Request, RequestApproval, User, Notification } = require('../models');
const STEPS = require('../config/approvalSteps');

// Create the approval rows for a request if it has none yet.
// The initial state follows the request's current status, so this also works
// for requests that existed before the workflow was added.
const ensureSteps = async (request, transaction) => {
  const count = await RequestApproval.count({
    where: { requestId: request.id },
    transaction,
  });
  if (count > 0) return;

  const s = request.status;

  const rows = STEPS.map((step, i) => {
    let status;
    if (s === 'approved' || s === 'completed') status = 'approved';
    else if (s === 'rejected') status = i === 0 ? 'rejected' : 'skipped';
    else if (s === 'in_review') status = i === 0 ? 'approved' : i === 1 ? 'pending' : 'waiting';
    else status = i === 0 ? 'pending' : 'waiting';

    return {
      requestId: request.id,
      stepNumber: step.stepNumber,
      stepName: step.name,
      requiredRoles: step.roles,
      status,
    };
  });

  await RequestApproval.bulkCreate(rows, { transaction });
};

// Run once at server start: gives old requests their approval rows.
const backfillAll = async () => {
  try {
    const requests = await Request.findAll({ attributes: ['id', 'status'] });
    for (const r of requests) {
      await ensureSteps(r);
    }
  } catch (error) {
    console.error('APPROVAL BACKFILL ERROR:', error.message);
  }
};

const notifyUsers = async (userIds, payload, transaction) => {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return;

  await Notification.bulkCreate(
    ids.map((userId) => ({
      userId,
      title: payload.title,
      message: payload.message,
      type: payload.type || 'info',
      link: payload.link || null,
      createdById: payload.createdById || null,
    })),
    { transaction }
  );
};

const notifyRoles = async (roles, exceptUserId, payload, transaction) => {
  const users = await User.findAll({
    where: { role: { [Op.in]: roles }, isActive: true },
    attributes: ['id'],
    transaction,
  });

  await notifyUsers(
    users.map((u) => u.id).filter((id) => id !== exceptUserId),
    payload,
    transaction
  );
};

module.exports = { STEPS, ensureSteps, backfillAll, notifyUsers, notifyRoles };
