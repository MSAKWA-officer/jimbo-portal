const { Op } = require('sequelize');
const { Payment, Expenditure, Request, Budget, RequestCategory, User } = require('../models');

const includeRelations = [
  {
    model: Expenditure,
    as: 'expenditure',
    attributes: ['id', 'amount', 'requestId', 'budgetId'],
    include: [
      {
        model: Request,
        as: 'request',
        attributes: ['id', 'trackingNumber', 'title', 'status'],
      },
      {
        model: Budget,
        as: 'budget',
        attributes: ['id', 'fiscalYear', 'categoryId'],
        include: [{ model: RequestCategory, as: 'category', attributes: ['id', 'name'] }],
      },
    ],
  },
  { model: User, as: 'recordedBy', attributes: ['id', 'fullName', 'email'] },
];

// Total of payments that count (not failed/cancelled) for a given expenditure,
// excluding the given paymentId record (used during update)
const sumPaidForExpenditure = async (expenditureId, excludePaymentId = null) => {
  const where = {
    expenditureId,
    status: ['pending', 'completed'],
  };
  if (excludePaymentId) where.id = { [Op.ne]: excludePaymentId };

  const payments = await Payment.findAll({ where });
  return payments.reduce((sum, p) => sum + Number(p.amount), 0);
};

// GET /api/payments?expenditureId=&status=
exports.getAll = async (req, res) => {
  try {
    const { expenditureId, status } = req.query;
    const where = {};
    if (expenditureId) where.expenditureId = expenditureId;
    if (status) where.status = status;

    const payments = await Payment.findAll({
      where,
      include: includeRelations,
      order: [['paymentDate', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve payments.', error: error.message });
  }
};

// GET /api/payments/:id
exports.getOne = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, { include: includeRelations });
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};

// POST /api/payments
exports.create = async (req, res) => {
  try {
    const {
      expenditureId,
      payeeName,
      payeePhone,
      amount,
      paymentMethod,
      referenceNumber,
      paymentDate,
      status,
      notes,
      receiptPath,
      receiptName,
    } = req.body;

    if (!expenditureId || !payeeName || amount === undefined) {
      return res.status(400).json({
        message: 'expenditureId, payeeName, and amount are required.',
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ message: 'The amount must be greater than zero.' });
    }

    const expenditure = await Expenditure.findByPk(expenditureId);
    if (!expenditure) {
      return res.status(404).json({ message: 'Expenditure not found.' });
    }

    const alreadyAllocated = await sumPaidForExpenditure(expenditureId);
    const remaining = Number(expenditure.amount) - alreadyAllocated;

    if (Number(amount) > remaining) {
      return res.status(400).json({
        message: `The remaining amount payable for this expenditure is TZS ${remaining.toLocaleString()}.`,
      });
    }

    const payment = await Payment.create({
      expenditureId,
      payeeName,
      payeePhone,
      amount,
      paymentMethod: paymentMethod || 'bank_transfer',
      referenceNumber,
      paymentDate: paymentDate || new Date(),
      status: status || 'pending',
      notes,
      receiptPath,
      receiptName,
      recordedById: req.user?.id || null,
    });

    const created = await Payment.findByPk(payment.id, { include: includeRelations });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Failed to record payment.', error: error.message });
  }
};

// PUT /api/payments/:id
exports.update = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });

    const {
      payeeName,
      payeePhone,
      amount,
      paymentMethod,
      referenceNumber,
      paymentDate,
      notes,
      receiptPath,
      receiptName,
    } = req.body;

    if (amount !== undefined) {
      if (Number(amount) <= 0) {
        return res.status(400).json({ message: 'The amount must be greater than zero.' });
      }

      const expenditure = await Expenditure.findByPk(payment.expenditureId);
      const alreadyAllocated = await sumPaidForExpenditure(payment.expenditureId, payment.id);
      const remaining = Number(expenditure.amount) - alreadyAllocated;

      if (Number(amount) > remaining) {
        return res.status(400).json({
          message: `The remaining amount payable for this expenditure is TZS ${remaining.toLocaleString()}.`,
        });
      }
    }

    await payment.update({
      ...(payeeName !== undefined ? { payeeName } : {}),
      ...(payeePhone !== undefined ? { payeePhone } : {}),
      ...(amount !== undefined ? { amount } : {}),
      ...(paymentMethod !== undefined ? { paymentMethod } : {}),
      ...(referenceNumber !== undefined ? { referenceNumber } : {}),
      ...(paymentDate !== undefined ? { paymentDate } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(receiptPath !== undefined ? { receiptPath } : {}),
      ...(receiptName !== undefined ? { receiptName } : {}),
    });

    const updated = await Payment.findByPk(payment.id, { include: includeRelations });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update payment.', error: error.message });
  }
};

// PATCH /api/payments/:id/status
// Changes the payment status (pending -> completed/failed/cancelled)
exports.updateStatus = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });

    const { status } = req.body;
    const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    await payment.update({ status });

    const updated = await Payment.findByPk(payment.id, { include: includeRelations });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update payment status.', error: error.message });
  }
};

// DELETE /api/payments/:id
exports.remove = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });
    await payment.destroy();
    res.json({ message: 'Payment removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete payment.', error: error.message });
  }
};