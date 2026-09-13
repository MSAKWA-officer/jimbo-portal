const express = require('express');

const router = express.Router();

const ctrl = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const uploadLetter = require('../middleware/uploadLetter');

router.use(protect);

// GET /api/requests/stats/summary
router.get('/stats/summary', ctrl.getStats);

// GET /api/requests
router.get('/', ctrl.getAll);

// GET /api/requests/:id
router.get('/:id', ctrl.getOne);

// POST /api/requests (kupokea ombi jipya kwa niaba ya mwananchi - kazi ya mapokezi)
router.post(
  '/',
  authorize('admin', 'staff', 'secretary'),
  uploadLetter.single('identificationLetter'),
  ctrl.create
);

// PUT /api/requests/:id (kuhariri taarifa za msingi za ombi - mapokezi)
router.put('/:id', authorize('admin', 'staff', 'secretary'), ctrl.update);

// PATCH /api/requests/:id/status (kuidhinisha/kukataa - uamuzi wa kiufundi)
router.patch('/:id/status', authorize('admin', 'staff', 'officer'), ctrl.updateStatus);

// DELETE /api/requests/:id
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;