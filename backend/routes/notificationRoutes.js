const express = require('express');

const router = express.Router();

const ctrl = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// GET /api/notifications/unread-count
router.get('/unread-count', ctrl.getUnreadCount);

// GET /api/notifications
router.get('/', ctrl.getAll);

// POST /api/notifications  (kutuma arifa - admin pekee)
router.post('/', authorize('admin'), ctrl.create);

// PATCH /api/notifications/read-all
router.patch('/read-all', ctrl.markAllAsRead);

// GET /api/notifications/:id
router.get('/:id', ctrl.getOne);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', ctrl.markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', ctrl.remove);

module.exports = router;
