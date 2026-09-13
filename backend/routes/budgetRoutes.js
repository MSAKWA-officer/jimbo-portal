const express = require('express');

const router = express.Router();

const ctrl = require('../controllers/budgetController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Muhtasari - iwe kabla ya /:id ili "stats" isisomwe kama id
router.get('/stats/summary', ctrl.getSummary);

router.get('/', ctrl.getAll);

router.get('/:id', ctrl.getOne);

router.post('/', authorize('admin', 'staff', 'secretary', 'officer'), ctrl.create);

router.put('/:id', authorize('admin', 'staff', 'secretary', 'officer'), ctrl.update);

router.patch('/:id/spend', authorize('admin', 'staff', 'secretary', 'officer'), ctrl.recordSpend);

router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
