const { Op } = require('sequelize');
const sequelize = require('../config/database');
const {
  Request,
  RequestCategory,
  Constituent,
  Budget,
  Expenditure,
  Payment,
  Project,
  ProjectActivity,
  Event,
  EventAttendee,
} = require('../models');

// ==========================================
// REPORT 1: REQUESTS
// GET /api/reports/requests?startDate=&endDate=&categoryId=&status=
// ==========================================
exports.getRequestsReport = async (req, res) => {
  try {
    const { startDate, endDate, categoryId, status } = req.query;

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.submittedAt = {};
      if (startDate) where.submittedAt[Op.gte] = new Date(startDate);
      if (endDate) where.submittedAt[Op.lte] = new Date(`${endDate}T23:59:59.999Z`);
    }

    const total = await Request.count({ where });

    const byStatus = await Request.findAll({
      where,
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('Request.id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const byPriority = await Request.findAll({
      where,
      attributes: ['priority', [sequelize.fn('COUNT', sequelize.col('Request.id')), 'count']],
      group: ['priority'],
      raw: true,
    });

    const byCategoryRaw = await Request.findAll({
      where,
      include: [{ model: RequestCategory, as: 'category', attributes: [] }],
      attributes: [
        'categoryId',
        [sequelize.col('category.name'), 'categoryName'],
        [sequelize.fn('COUNT', sequelize.col('Request.id')), 'count'],
      ],
      group: ['categoryId', 'category.name', 'category.id'],
      raw: true,
    });

    const byMonthRaw = await Request.findAll({
      where,
      attributes: [
        [sequelize.fn('to_char', sequelize.col('submitted_at'), 'YYYY-MM'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('Request.id')), 'count'],
      ],
      group: [sequelize.fn('to_char', sequelize.col('submitted_at'), 'YYYY-MM')],
      order: [[sequelize.fn('to_char', sequelize.col('submitted_at'), 'YYYY-MM'), 'ASC']],
      raw: true,
    });

    // Average time to resolve a request (in days), for completed requests
    const resolvedRequests = await Request.findAll({
      where: { ...where, resolvedAt: { [Op.ne]: null } },
      attributes: ['submittedAt', 'resolvedAt'],
      raw: true,
    });

    let avgResolutionDays = null;
    if (resolvedRequests.length > 0) {
      const totalDays = resolvedRequests.reduce((sum, r) => {
        const diffMs = new Date(r.resolvedAt) - new Date(r.submittedAt);
        return sum + diffMs / (1000 * 60 * 60 * 24);
      }, 0);
      avgResolutionDays = Number((totalDays / resolvedRequests.length).toFixed(1));
    }

    res.json({
      total,
      byStatus: byStatus.map((r) => ({ status: r.status, count: Number(r.count) })),
      byPriority: byPriority.map((r) => ({ priority: r.priority, count: Number(r.count) })),
      byCategory: byCategoryRaw.map((r) => ({
        categoryId: r.categoryId,
        categoryName: r.categoryName || 'No Category',
        count: Number(r.count),
      })),
      byMonth: byMonthRaw.map((r) => ({ month: r.month, count: Number(r.count) })),
      avgResolutionDays,
    });
  } catch (error) {
    console.error('REPORTS - REQUESTS ERROR:', error);
    res.status(500).json({ message: 'Failed to generate requests report.', error: error.message });
  }
};

// ==========================================
// REPORT 2: FINANCIAL (BUDGETS / EXPENDITURES / PAYMENTS)
// GET /api/reports/financial?fiscalYear=
// ==========================================
exports.getFinancialReport = async (req, res) => {
  try {
    const { fiscalYear } = req.query;
    const budgetWhere = {};
    if (fiscalYear) budgetWhere.fiscalYear = fiscalYear;

    const budgets = await Budget.findAll({
      where: budgetWhere,
      include: [{ model: RequestCategory, as: 'category', attributes: ['id', 'name'] }],
      order: [['fiscalYear', 'DESC']],
    });

    const byCategory = budgets.map((b) => {
      const allocated = Number(b.allocatedAmount);
      const spent = Number(b.spentAmount);
      return {
        categoryId: b.categoryId,
        categoryName: b.category?.name || 'No Category',
        fiscalYear: b.fiscalYear,
        allocatedAmount: allocated,
        spentAmount: spent,
        remainingAmount: allocated - spent,
        percentUsed: allocated > 0 ? Number(((spent / allocated) * 100).toFixed(1)) : 0,
      };
    });

    const totals = byCategory.reduce(
      (acc, b) => {
        acc.totalAllocated += b.allocatedAmount;
        acc.totalSpent += b.spentAmount;
        return acc;
      },
      { totalAllocated: 0, totalSpent: 0 }
    );

    const budgetIds = budgets.map((b) => b.id);

    const expenditureWhere = budgetIds.length ? { budgetId: { [Op.in]: budgetIds } } : {};
    const expenditures = fiscalYear
      ? await Expenditure.findAll({ where: expenditureWhere })
      : await Expenditure.findAll();

    const totalExpenditures = expenditures.reduce((sum, e) => sum + Number(e.amount), 0);

    const expenditureIds = expenditures.map((e) => e.id);
    const paymentWhere = fiscalYear && expenditureIds.length ? { expenditureId: { [Op.in]: expenditureIds } } : {};
    const payments = fiscalYear
      ? await Payment.findAll({ where: paymentWhere })
      : await Payment.findAll();

    const paymentsByMethodRaw = await Payment.findAll({
      where: paymentWhere,
      attributes: ['paymentMethod', [sequelize.fn('COUNT', sequelize.col('id')), 'count'], [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['paymentMethod'],
      raw: true,
    });

    const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Available fiscal years (for the frontend dropdown)
    const fiscalYears = await Budget.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('fiscal_year')), 'fiscalYear']],
      order: [['fiscal_year', 'DESC']],
      raw: true,
    });

    res.json({
      totalAllocated: totals.totalAllocated,
      totalSpent: totals.totalSpent,
      totalRemaining: totals.totalAllocated - totals.totalSpent,
      totalExpenditures,
      totalPaymentsRecorded: totalPayments,
      expenditureCount: expenditures.length,
      paymentCount: payments.length,
      byCategory,
      paymentsByMethod: paymentsByMethodRaw.map((p) => ({
        method: p.paymentMethod,
        count: Number(p.count),
        total: Number(p.total || 0),
      })),
      availableFiscalYears: fiscalYears.map((f) => f.fiscalYear).filter(Boolean),
    });
  } catch (error) {
    console.error('REPORTS - FINANCIAL ERROR:', error);
    res.status(500).json({ message: 'Failed to generate financial report.', error: error.message });
  }
};

// ==========================================
// REPORT 3: PROJECTS
// GET /api/reports/projects?categoryId=
// ==========================================
exports.getProjectsReport = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = {};
    if (categoryId) where.categoryId = categoryId;

    const projects = await Project.findAll({
      where,
      include: [{ model: RequestCategory, as: 'category', attributes: ['id', 'name'] }],
    });

    const total = projects.length;

    const byStatus = ['planned', 'ongoing', 'completed', 'on_hold', 'cancelled'].map((status) => ({
      status,
      count: projects.filter((p) => p.status === status).length,
    }));

    const byCategoryMap = {};
    projects.forEach((p) => {
      const key = p.category?.name || 'No Category';
      if (!byCategoryMap[key]) byCategoryMap[key] = 0;
      byCategoryMap[key] += 1;
    });
    const byCategory = Object.entries(byCategoryMap).map(([categoryName, count]) => ({ categoryName, count }));

    const projectIds = projects.map((p) => p.id);
    const activities = projectIds.length
      ? await ProjectActivity.findAll({ where: { projectId: { [Op.in]: projectIds } } })
      : [];

    const activitiesByStatus = ['planned', 'ongoing', 'completed', 'cancelled'].map((status) => ({
      status,
      count: activities.filter((a) => a.status === status).length,
    }));

    res.json({
      total,
      byStatus,
      byCategory,
      totalActivities: activities.length,
      activitiesByStatus,
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        categoryName: p.category?.name || null,
        location: p.location,
        startDate: p.startDate,
        endDate: p.endDate,
      })),
    });
  } catch (error) {
    console.error('REPORTS - PROJECTS ERROR:', error);
    res.status(500).json({ message: 'Failed to generate projects report.', error: error.message });
  }
};

// ==========================================
// REPORT 4: CONSTITUENTS
// GET /api/reports/constituents
// ==========================================
exports.getConstituentsReport = async (req, res) => {
  try {
    const total = await Constituent.count();

    const byGenderRaw = await Constituent.findAll({
      attributes: ['gender', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['gender'],
      raw: true,
    });

    const byRegionRaw = await Constituent.findAll({
      attributes: ['region', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['region'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true,
    });

    const byDistrictRaw = await Constituent.findAll({
      attributes: ['district', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['district'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true,
    });

    // Constituents with more than one request (frequent requesters)
    const topRequesters = await Constituent.findAll({
      attributes: [
        'id',
        'fullName',
        'phone',
        [sequelize.fn('COUNT', sequelize.col('requests.id')), 'requestCount'],
      ],
      include: [{ model: Request, as: 'requests', attributes: [] }],
      group: ['Constituent.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('requests.id')), 'DESC']],
      limit: 10,
      subQuery: false,
      raw: true,
    });

    res.json({
      total,
      byGender: byGenderRaw.map((r) => ({ gender: r.gender || 'Unspecified', count: Number(r.count) })),
      byRegion: byRegionRaw.map((r) => ({ region: r.region || 'Unspecified', count: Number(r.count) })),
      byDistrict: byDistrictRaw.map((r) => ({ district: r.district || 'Unspecified', count: Number(r.count) })),
      topRequesters: topRequesters.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        phone: c.phone,
        requestCount: Number(c.requestCount),
      })),
    });
  } catch (error) {
    console.error('REPORTS - CONSTITUENTS ERROR:', error);
    res.status(500).json({ message: 'Failed to generate constituents report.', error: error.message });
  }
};