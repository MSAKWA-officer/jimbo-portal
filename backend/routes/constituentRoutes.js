const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/constituentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // routes zote hapa chini zinahitaji login

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Kuandikisha/kuhariri wananchi ni kazi ya ofisi (mapokezi) - admin, staff, secretary
router.post('/', authorize('admin', 'staff', 'secretary'), ctrl.create);
router.put('/:id', authorize('admin', 'staff', 'secretary'), ctrl.update);

// Kufuta ni admin pekee
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
