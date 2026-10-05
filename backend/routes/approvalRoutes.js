const express = require('express');

const router = express.Router();

const ctrl = require('../controllers/approvalController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

const approvers = authorize('admin', 'staff', 'secretary', 'officer');

// GET /api/approvals/pending  (my queue)
router.get('/pending', approvers, ctrl.getPending);

// GET /api/approvals/request/:requestId  (steps + history)
router.get('/request/:requestId', ctrl.getForRequest);

// POST /api/approvals/request/:requestId/approve
router.post('/request/:requestId/approve', approvers, ctrl.approve);

// POST /api/approvals/request/:requestId/reject
router.post('/request/:requestId/reject', approvers, ctrl.reject);

module.exports = router;
