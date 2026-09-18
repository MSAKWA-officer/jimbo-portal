const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/constituentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // routes zote hapa chini zinahitaji login

// SELF-SERVICE (CITIZEN) - must come before "/:id" so "me" is not read as an id
router.post('/me', authorize('citizen'), ctrl.registerSelf);
router.get('/me', authorize('citizen'), ctrl.getMyProfile);
router.put('/me', authorize('citizen'), ctrl.updateMyProfile);

router.get('/', authorize('admin', 'staff', 'secretary', 'officer'), ctrl.getAll);
router.get('/:id', authorize('admin', 'staff', 'secretary', 'officer'), ctrl.getOne);

// Kuandikisha/kuhariri wananchi ni kazi ya ofisi (mapokezi) - admin, staff, secretary
router.post('/', authorize('admin', 'staff', 'secretary'), ctrl.create);
router.put('/:id', authorize('admin', 'staff', 'secretary'), ctrl.update);

// Kufuta ni admin pekee
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
