const { Budget, RequestCategory, User } = require('../models');

const includeRelations = [
  { model: RequestCategory, as: 'category' },
  { model: User, as: 'createdBy', attributes: ['id', 'fullName', 'email'] },
];

// GET /api/budgets?fiscalYear=&categoryId=
exports.getAll = async (req, res) => {
  try {
    const { fiscalYear, categoryId } = req.query;
    const where = {};
    if (fiscalYear) where.fiscalYear = fiscalYear;
    if (categoryId) where.categoryId = categoryId;

    const budgets = await Budget.findAll({
      where,
      include: includeRelations,
      order: [['fiscalYear', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve budgets.', error: error.message });
  }
};

// GET /api/budgets/:id
exports.getOne = async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id, { include: includeRelations });
    if (!budget) return res.status(404).json({ message: 'Budget not found.' });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};

// GET /api/budgets/stats/summary?fiscalYear=
// Overall budget summary (for dashboard/reports): total allocated,
// total spent, balance, and the breakdown by category.
exports.getSummary = async (req, res) => {
  try {
    const { fiscalYear } = req.query;
    const where = {};
    if (fiscalYear) where.fiscalYear = fiscalYear;

    const budgets = await Budget.findAll({ where, include: includeRelations });

    const totals = budgets.reduce(
      (acc, b) => {
        const allocated = Number(b.allocatedAmount);
        const spent = Number(b.spentAmount);
        acc.totalAllocated += allocated;
        acc.totalSpent += spent;
        return acc;
      },
      { totalAllocated: 0, totalSpent: 0 }
    );

    const byCategory = budgets.map((b) => {
      const allocated = Number(b.allocatedAmount);
      const spent = Number(b.spentAmount);
      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category?.name || null,
        fiscalYear: b.fiscalYear,
        allocatedAmount: allocated,
        spentAmount: spent,
        remainingAmount: allocated - spent,
        percentUsed: allocated > 0 ? Number(((spent / allocated) * 100).toFixed(1)) : 0,
      };
    });

    res.json({
      totalAllocated: totals.totalAllocated,
      totalSpent: totals.totalSpent,
      totalRemaining: totals.totalAllocated - totals.totalSpent,
      byCategory,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve budget summary.', error: error.message });
  }
};

// POST /api/budgets
exports.create = async (req, res) => {
  try {
    const { categoryId, fiscalYear, allocatedAmount, notes } = req.body;

    if (!categoryId || !fiscalYear || allocatedAmount === undefined) {
      return res.status(400).json({
        message: 'categoryId, fiscalYear, and allocatedAmount are required.',
      });
    }

    const category = await RequestCategory.findByPk(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });

    const existing = await Budget.findOne({ where: { categoryId, fiscalYear } });
    if (existing) {
      return res.status(409).json({
        message: `A budget for this category already exists for fiscal year ${fiscalYear}.`,
      });
    }

    const budget = await Budget.create({
      categoryId,
      fiscalYear,
      allocatedAmount,
      notes,
      createdById: req.user?.id || null,
    });

    const created = await Budget.findByPk(budget.id, { include: includeRelations });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add budget.', error: error.message });
  }
};

// PUT /api/budgets/:id
exports.update = async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found.' });

    const { categoryId, fiscalYear, allocatedAmount, notes } = req.body;

    await budget.update({
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(fiscalYear !== undefined ? { fiscalYear } : {}),
      ...(allocatedAmount !== undefined ? { allocatedAmount } : {}),
      ...(notes !== undefined ? { notes } : {}),
    });

    const updated = await Budget.findByPk(budget.id, { include: includeRelations });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update budget.', error: error.message });
  }
};

// PATCH /api/budgets/:id/spend
// Increases (or decreases, with a negative value) the amount spent - used
// when expenditure occurs for a related request/task, without rewriting the
// whole record.
exports.recordSpend = async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found.' });

    const { amount } = req.body;
    if (amount === undefined || Number.isNaN(Number(amount))) {
      return res.status(400).json({ message: 'amount (a number) is required.' });
    }

    const newSpent = Number(budget.spentAmount) + Number(amount);
    if (newSpent < 0) {
      return res.status(400).json({ message: 'The amount spent cannot be negative.' });
    }

    await budget.update({ spentAmount: newSpent });

    const updated = await Budget.findByPk(budget.id, { include: includeRelations });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update expenditure.', error: error.message });
  }
};

// DELETE /api/budgets/:id
exports.remove = async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found.' });
    await budget.destroy();
    res.json({ message: 'Budget removed.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};