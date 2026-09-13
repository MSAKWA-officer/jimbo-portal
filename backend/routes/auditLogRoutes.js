const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auditLogController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // routes zote hapa chini zinahitaji login

// Kumbukumbu za matendo ni nyeti - admin pekee ndiye anaruhusiwa kuziona.
// (Hakuna POST/PUT/DELETE hapa: audit logs huandikwa moja kwa moja na mfumo
// kupitia recordAuditLog() ndani ya controllers nyingine, si kwa mtumiaji.)
router.get('/', authorize('admin'), ctrl.getAll);
router.get('/:id', authorize('admin'), ctrl.getOne);

module.exports = router;
