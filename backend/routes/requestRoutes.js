const express = require('express');

const router = express.Router();

const ctrl = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const uploadLetter = require('../middleware/uploadLetter');

router.use(protect);

// GET /api/requests/mine (CITIZEN - their own submitted requests)
router.get('/mine', authorize('citizen'), ctrl.getMine);

// GET /api/requests/stats/summary
router.get('/stats/summary', authorize('admin', 'staff', 'secretary', 'officer'), ctrl.getStats);

// GET /api/requests
router.get('/', authorize('admin', 'staff', 'secretary', 'officer'), ctrl.getAll);

// GET /api/requests/:id
router.get('/:id', ctrl.getOne);

// POST /api/requests (staff receiving a request on behalf of a citizen, OR
// a citizen submitting their own request directly)
router.post(
  '/',
  authorize('admin', 'staff', 'secretary', 'citizen'),
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
