const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // routes zote hapa chini zinahitaji login

// Orodha ya watumiaji ni nyeti (majina, barua pepe, role) - admin pekee.
router.get('/', authorize('admin'), ctrl.getAll);
router.get('/:id', authorize('admin'), ctrl.getOne);
router.put('/:id', authorize('admin'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);
// userRoutes.js — ongeza mstari huu (karibu na route zingine za /:id)
router.put('/:id/reset-password', authorize('admin'), ctrl.resetPassword);

module.exports = router;
