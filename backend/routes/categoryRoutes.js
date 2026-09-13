const express = require('express');

const router = express.Router();

const ctrl = require('../controllers/categoryController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', ctrl.getAll);

router.post('/', authorize('admin', 'staff', 'officer'), ctrl.create);

router.put('/:id', authorize('admin', 'staff', 'officer'), ctrl.update);

router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;