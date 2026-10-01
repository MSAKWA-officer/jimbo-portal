const express = require('express');

const router = express.Router();

const ctrl = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const uploadLetter = require('../middleware/uploadLetter');

router.use(protect);

// GET /api/requests/stats/summary
router.get('/stats/summary', ctrl.getStats);

// GET /api/requests
router.get('/', ctrl.getAll);

// GET /api/requests/:id/letter  (view identification letter)
router.get('/:id/letter', ctrl.getLetter);

// GET /api/requests/:id
router.get('/:id', ctrl.getOne);

// POST /api/requests
router.post(
  '/',
  uploadLetter.single('identificationLetter'),
  ctrl.create
);

// PUT /api/requests/:id
router.put('/:id', ctrl.update);

// PATCH /api/requests/:id/status
router.patch('/:id/status', ctrl.updateStatus);

// DELETE /api/requests/:id
router.delete('/:id', ctrl.remove);

module.exports = router;