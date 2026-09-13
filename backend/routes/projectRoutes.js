const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // routes zote hapa chini zinahitaji login

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', authorize('admin', 'staff', 'officer'), ctrl.create);
router.put('/:id', authorize('admin', 'staff', 'officer'), ctrl.update);
router.patch('/:id/status', authorize('admin', 'staff', 'officer'), ctrl.updateStatus);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
