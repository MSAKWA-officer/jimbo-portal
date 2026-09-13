const express = require('express');

const router = express.Router();

const ctrl = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// Ripoti zote ni za kusoma tu (read-only) - watumiaji wote walioingia (admin/staff/viewer) wanaweza kuziona
router.use(protect);

// GET /api/reports/requests?startDate=&endDate=&categoryId=&status=
router.get('/requests', ctrl.getRequestsReport);

// GET /api/reports/financial?fiscalYear=
router.get('/financial', ctrl.getFinancialReport);

// GET /api/reports/projects?categoryId=
router.get('/projects', ctrl.getProjectsReport);

// GET /api/reports/constituents
router.get('/constituents', ctrl.getConstituentsReport);

module.exports = router;
