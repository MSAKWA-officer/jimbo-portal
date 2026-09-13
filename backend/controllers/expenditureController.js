const { Expenditure, Request, Budget, RequestCategory, User, sequelize } = require('../models');

const includeRelations = [
  {
    model: Request,
    as: 'request',
    attributes: ['id', 'trackingNumber', 'title', 'status', 'categoryId'],
  },
  {
    model: Budget,
    as: 'budget',
    attributes: ['id', 'fiscalYear', 'allocatedAmount', 'spentAmount', 'categoryId'],
    include: [{ model: RequestCategory, as: 'category', attributes: ['id', 'name'] }],
  },
  { model: User, as: 'recordedBy', attributes: ['id', 'fullName', 'email'] },
];

// GET /api/expenditures?requestId=&budgetId=&fiscalYear=
exports.getAll = async (req, res) => {
  try {
    const { requestId, budgetId, fiscalYear } = req.query;
    const where = {};
    if (requestId) where.requestId = requestId;
    if (budgetId) where.budgetId = budgetId;

    const budgetWhere = fiscalYear ? { fiscalYear } : undefined;

    const expenditures = await Expenditure.findAll({
      where,
      include: budgetWhere
        ? includeRelations.map((inc) =>
            inc.as === 'budget' ? { ...inc, where: budgetWhere } : inc
          )
        : includeRelations,
      order: [['expenditureDate', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json(expenditures);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve expenditures.', error: error.message });
  }
};

// GET /api/expenditures/:id
exports.getOne = async (req, res) => {
  try {
    const expenditure = await Expenditure.findByPk(req.params.id, { include: includeRelations });
    if (!expenditure) return res.status(404).json({ message: 'Expenditure not found.' });
    res.json(expenditure);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};

// POST /api/expenditures
// Links a Request to an approved Budget, and increases that budget's
// spentAmount by the amount spent.
exports.create = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { requestId, budgetId, amount, description, expenditureDate, receiptPath, receiptName } =
      req.body;

    if (!requestId || !budgetId || amount === undefined) {
      await t.rollback();
      return res.status(400).json({ message: 'requestId, budgetId, and amount are required.' });
    }

    if (Number(amount) <= 0) {
      await t.rollback();
      return res.status(400).json({ message: 'The amount must be greater than zero.' });
    }

    const request = await Request.findByPk(requestId, { transaction: t });
    if (!request) {
      await t.rollback();
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (!['approved', 'completed'].includes(request.status)) {
      await t.rollback();
      return res.status(400).json({
        message: 'Expenditures can only be recorded for a request that is approved or completed.',
      });
    }

    const budget = await Budget.findByPk(budgetId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!budget) {
      await t.rollback();
      return res.status(404).json({ message: 'Budget not found.' });
    }

    if (budget.categoryId !== request.categoryId) {
      await t.rollback();
      return res.status(400).json({
        message: 'The budget category does not match this request\'s category.',
      });
    }

    const remaining = Number(budget.allocatedAmount) - Number(budget.spentAmount);
    if (Number(amount) > remaining) {
      await t.rollback();
      return res.status(400).json({
        message: `The budget balance (TZS ${remaining.toLocaleString()}) is not enough for this amount.`,
      });
    }

    const expenditure = await Expenditure.create(
      {
        requestId,
        budgetId,
        amount,
        description,
        expenditureDate: expenditureDate || new Date(),
        receiptPath,
        receiptName,
        recordedById: req.user?.id || null,
      },
      { transaction: t }
    );

    await budget.update(
      { spentAmount: Number(budget.spentAmount) + Number(amount) },
      { transaction: t }
    );

    await t.commit();

    const created = await Expenditure.findByPk(expenditure.id, { include: includeRelations });
    res.status(201).json(created);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: 'Failed to record expenditure.', error: error.message });
  }
};

// PUT /api/expenditures/:id
// If "amount" or "budgetId" have changed, the spentAmount of the budget(s)
// (old and/or new) is adjusted accordingly.
exports.update = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const expenditure = await Expenditure.findByPk(req.params.id, { transaction: t });
    if (!expenditure) {
      await t.rollback();
      return res.status(404).json({ message: 'Expenditure not found.' });
    }

    const { amount, description, expenditureDate, receiptPath, receiptName, budgetId } = req.body;

    const newAmount = amount !== undefined ? Number(amount) : Number(expenditure.amount);
    const newBudgetId = budgetId !== undefined ? budgetId : expenditure.budgetId;

    if (newAmount <= 0) {
      await t.rollback();
      return res.status(400).json({ message: 'The amount must be greater than zero.' });
    }

    const oldBudget = await Budget.findByPk(expenditure.budgetId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!oldBudget) {
      await t.rollback();
      return res.status(404).json({ message: 'The original budget was not found.' });
    }

    if (newBudgetId === expenditure.budgetId) {
      // Same budget - just adjust the amount difference (diff)
      const diff = newAmount - Number(expenditure.amount);
      const remaining = Number(oldBudget.allocatedAmount) - Number(oldBudget.spentAmount);

      if (diff > remaining) {
        await t.rollback();
        return res.status(400).json({
          message: `The budget balance (TZS ${remaining.toLocaleString()}) is not enough for this increase.`,
        });
      }

      await oldBudget.update(
        { spentAmount: Number(oldBudget.spentAmount) + diff },
        { transaction: t }
      );
    } else {
      // Budget has changed - restore the old amount, then charge the new budget
      const newBudget = await Budget.findByPk(newBudgetId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!newBudget) {
        await t.rollback();
        return res.status(404).json({ message: 'The new budget was not found.' });
      }

      const remainingNew = Number(newBudget.allocatedAmount) - Number(newBudget.spentAmount);
      if (newAmount > remainingNew) {
        await t.rollback();
        return res.status(400).json({
          message: `The new budget's balance (TZS ${remainingNew.toLocaleString()}) is not enough.`,
        });
      }

      await oldBudget.update(
        { spentAmount: Number(oldBudget.spentAmount) - Number(expenditure.amount) },
        { transaction: t }
      );
      await newBudget.update(
        { spentAmount: Number(newBudget.spentAmount) + newAmount },
        { transaction: t }
      );
    }

    await expenditure.update(
      {
        amount: newAmount,
        budgetId: newBudgetId,
        ...(description !== undefined ? { description } : {}),
        ...(expenditureDate !== undefined ? { expenditureDate } : {}),
        ...(receiptPath !== undefined ? { receiptPath } : {}),
        ...(receiptName !== undefined ? { receiptName } : {}),
      },
      { transaction: t }
    );

    await t.commit();

    const updated = await Expenditure.findByPk(expenditure.id, { include: includeRelations });
    res.json(updated);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: 'Failed to update expenditure.', error: error.message });
  }
};

// DELETE /api/expenditures/:id
// Restores (removes) the corresponding amount from the budget's spentAmount before deleting the record.
exports.remove = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const expenditure = await Expenditure.findByPk(req.params.id, { transaction: t });
    if (!expenditure) {
      await t.rollback();
      return res.status(404).json({ message: 'Expenditure not found.' });
    }

    const budget = await Budget.findByPk(expenditure.budgetId, { transaction: t, lock: t.LOCK.UPDATE });
    if (budget) {
      await budget.update(
        { spentAmount: Math.max(0, Number(budget.spentAmount) - Number(expenditure.amount)) },
        { transaction: t }
      );
    }

    await expenditure.destroy({ transaction: t });
    await t.commit();

    res.json({ message: 'Expenditure removed and the budget balance has been restored.' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to delete expenditure.', error: error.message });
  }
};