const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // routes zote hapa chini zinahitaji login

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', authorize('admin', 'staff', 'secretary'), ctrl.create);
router.put('/:id', authorize('admin', 'staff', 'secretary'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
