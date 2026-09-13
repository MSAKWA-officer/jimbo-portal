const express = require('express');

const router = express.Router();

const ctrl = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const uploadDocument = require('../middleware/uploadDocument');

router.use(protect);

// GET /api/documents/stats/summary
router.get('/stats/summary', ctrl.getStats);

// GET /api/documents
router.get('/', ctrl.getAll);

// GET /api/documents/:id
router.get('/:id', ctrl.getOne);

// POST /api/documents  (kila mtumiaji aliye-login anaweza ku-share hati)
router.post('/', uploadDocument.single('file'), ctrl.create);

// PATCH /api/documents/:id/status  (approve/reject - admin pekee)
router.patch(
  '/:id/status',
  authorize('admin'),
  ctrl.updateStatus
);

// DELETE /api/documents/:id (kufuta hati yoyote - admin pekee)
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
