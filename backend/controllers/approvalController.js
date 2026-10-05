const { Op } = require('sequelize');

const {
  Document,
  Request,
  RequestApproval,
  RequestCategory,
  Constituent,
  User,
  sequelize,
} = require('../models');
const { ensureSteps, notifyUsers, notifyRoles } = require('../utils/approvalHelpers');
const { recordAuditLog } = require('./auditLogController');

const actedByInclude = {
  model: User,
  as: 'actedBy',
  attributes: ['id', 'fullName', 'role'],
};

// ==========================================
// MY QUEUE: steps waiting for MY decision
// GET /api/approvals/pending
// ==========================================
exports.getPending = async (req, res) => {
  try {
    const rows = await RequestApproval.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Request,
          as: 'request',
          include: [
            { model: Constituent, as: 'constituent', attributes: ['id', 'fullName'] },
            { model: RequestCategory, as: 'category', attributes: ['id', 'name'] },
            { model: User, as: 'submittedBy', attributes: ['id', 'fullName'] },
          ],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    const mine = rows.filter(
      (r) =>
        r.requiredRoles.includes(req.user.role) &&
        r.request &&
        r.request.submittedById !== req.user.id
    );

    // Documents: only admins can decide them, and never their own uploads
    let documents = [];
    if (req.user.role === 'admin') {
      documents = await Document.findAll({
        where: { status: 'pending', uploadedById: { [Op.ne]: req.user.id } },
        include: [{ model: User, as: 'uploadedBy', attributes: ['id', 'fullName'] }],
        order: [['createdAt', 'ASC']],
      });
    }

    return res.json({ applications: mine, documents });
  } catch (error) {
    console.error('GET PENDING APPROVALS ERROR:', error);
    return res.status(500).json({
      message: 'Failed to load pending approvals.',
      error: error.message,
    });
  }
};

// ==========================================
// APPROVAL HISTORY OF ONE REQUEST
// GET /api/approvals/request/:requestId
// ==========================================
exports.getForRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const isOwner = request.submittedById === req.user.id;
    if (req.user.role === 'citizen' && !isOwner) {
      return res.status(403).json({ message: 'You do not have permission to view this.' });
    }

    await ensureSteps(request);

    const steps = await RequestApproval.findAll({
      where: { requestId: request.id },
      include: [actedByInclude],
      order: [['stepNumber', 'ASC']],
    });

    const current = steps.find((s) => s.status === 'pending') || null;

    const canAct = Boolean(
      current &&
        current.requiredRoles.includes(req.user.role) &&
        !isOwner
    );

    return res.json({ requestStatus: request.status, steps, current, canAct });
  } catch (error) {
    console.error('GET REQUEST APPROVALS ERROR:', error);
    return res.status(500).json({
      message: 'Failed to load approval history.',
      error: error.message,
    });
  }
};

// ==========================================
// APPROVE / REJECT the current step
// POST /api/approvals/request/:requestId/approve
// POST /api/approvals/request/:requestId/reject
// ==========================================
const decide = (decision) => async (req, res) => {
  const t = await sequelize.transaction();

  try {
    // Lock the request so two people cannot decide at the same time
    const request = await Request.findByPk(req.params.requestId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!request) {
      await t.rollback();
      return res.status(404).json({ message: 'Application not found.' });
    }

    await ensureSteps(request, t);

    if (request.submittedById === req.user.id) {
      await t.rollback();
      return res.status(403).json({
        message: 'You cannot approve or reject an application you submitted.',
      });
    }

    const current = await RequestApproval.findOne({
      where: { requestId: request.id, status: 'pending' },
      order: [['stepNumber', 'ASC']],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!current) {
      await t.rollback();
      return res.status(400).json({
        message: 'This application has no step waiting for a decision.',
      });
    }

    if (!current.requiredRoles.includes(req.user.role)) {
      await t.rollback();
      return res.status(403).json({
        message: 'Your role cannot decide this step.',
      });
    }

    const comment = (req.body.comment || '').trim();

    if (decision === 'rejected' && !comment) {
      await t.rollback();
      return res.status(400).json({ message: 'A comment is required when rejecting.' });
    }

    current.status = decision;
    current.actedById = req.user.id;
    current.comment = comment || null;
    current.actedAt = new Date();
    await current.save({ transaction: t });

    const link = `/applications/${request.id}`;
    const ref = `${request.trackingNumber} - ${request.title}`;

    if (decision === 'rejected') {
      await RequestApproval.update(
        { status: 'skipped' },
        {
          where: { requestId: request.id, status: 'waiting' },
          transaction: t,
        }
      );

      request.status = 'rejected';
      request.resolvedAt = null;

      await notifyUsers(
        [request.submittedById],
        {
          title: 'Application rejected',
          message: `${ref} was rejected at "${current.stepName}". Reason: ${comment}`,
          type: 'error',
          link,
          createdById: req.user.id,
        },
        t
      );
    } else {
      const next = await RequestApproval.findOne({
        where: { requestId: request.id, status: 'waiting' },
        order: [['stepNumber', 'ASC']],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (next) {
        next.status = 'pending';
        await next.save({ transaction: t });

        request.status = 'in_review';

        await notifyRoles(
          next.requiredRoles,
          request.submittedById,
          {
            title: 'Approval needed',
            message: `${ref} is waiting for "${next.stepName}".`,
            type: 'warning',
            link,
            createdById: req.user.id,
          },
          t
        );
      } else {
        request.status = 'approved';

        await notifyUsers(
          [request.submittedById],
          {
            title: 'Application approved',
            message: `${ref} has been fully approved.`,
            type: 'success',
            link,
            createdById: req.user.id,
          },
          t
        );
      }
    }

    await request.save({ transaction: t });
    await t.commit();

    await recordAuditLog({
      userId: req.user.id,
      action: 'update',
      entityType: 'Request',
      entityId: request.id,
      description: `${decision === 'approved' ? 'Approved' : 'Rejected'} step "${current.stepName}" of ${request.trackingNumber}`,
      changes: { step: current.stepNumber, decision, comment: comment || null, requestStatus: request.status },
      ipAddress: req.ip,
    });

    return res.json({
      message: decision === 'approved' ? 'Step approved.' : 'Application rejected.',
      requestStatus: request.status,
    });
  } catch (error) {
    await t.rollback().catch(() => {});
    console.error('APPROVAL DECISION ERROR:', error);
    return res.status(500).json({
      message: 'Failed to save the decision.',
      error: error.message,
    });
  }
};

exports.approve = decide('approved');
exports.reject = decide('rejected');
