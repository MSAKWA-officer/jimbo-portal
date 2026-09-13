const { Op } = require('sequelize');
const { Notification, User } = require('../models');

const includeRelations = [
  { model: User, as: 'createdBy', attributes: ['id', 'fullName', 'email'] },
];

// ==========================================
// GET ALL (my notifications)
// GET /api/notifications?isRead=&type=
// ==========================================
exports.getAll = async (req, res) => {
  try {
    const { isRead, type } = req.query;

    const where = { userId: req.user.id };

    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (type) where.type = type;

    const notifications = await Notification.findAll({
      where,
      include: includeRelations,
      order: [['createdAt', 'DESC']],
      limit: 200, // guard against pulling too many notifications at once
    });

    return res.json(notifications);
  } catch (error) {
    console.error('GET ALL NOTIFICATIONS ERROR:', error);

    return res.status(500).json({
      message: 'Failed to retrieve notifications.',
      error: error.message,
    });
  }
};

// ==========================================
// COUNT OF UNREAD NOTIFICATIONS
// GET /api/notifications/unread-count
// ==========================================
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    return res.json({ count });
  } catch (error) {
    console.error('GET UNREAD COUNT ERROR:', error);

    return res.status(500).json({
      message: 'Failed to retrieve notification count.',
      error: error.message,
    });
  }
};

// ==========================================
// GET ONE
// GET /api/notifications/:id
// ==========================================
exports.getOne = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id, {
      include: includeRelations,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    // A user can only view their own notification (except admins)
    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to view this notification.' });
    }

    return res.json(notification);
  } catch (error) {
    console.error('GET ONE NOTIFICATION ERROR:', error);

    return res.status(500).json({
      message: 'An error occurred.',
      error: error.message,
    });
  }
};

// ==========================================
// CREATE / SEND NOTIFICATION (admin only)
// POST /api/notifications
// Body: { userIds: [1,2,3], broadcastToAll: false, title, message, type, link }
// ==========================================
exports.create = async (req, res) => {
  try {
    const { userIds, broadcastToAll, title, message, type, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: 'Please fill in the notification title and message.',
      });
    }

    let recipientIds = [];

    if (broadcastToAll) {
      const users = await User.findAll({
        where: { isActive: true },
        attributes: ['id'],
      });
      recipientIds = users.map((u) => u.id);
    } else {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          message: 'Select at least one recipient, or send to everyone (broadcastToAll).',
        });
      }
      recipientIds = userIds;
    }

    const validTypes = ['info', 'success', 'warning', 'error'];
    const notifType = validTypes.includes(type) ? type : 'info';

    const rows = recipientIds.map((userId) => ({
      userId,
      title: title.trim(),
      message: message.trim(),
      type: notifType,
      link: link || null,
      createdById: req.user.id,
    }));

    const created = await Notification.bulkCreate(rows);

    return res.status(201).json({
      message: `Notification sent to ${created.length} user(s).`,
      count: created.length,
    });
  } catch (error) {
    console.error('CREATE NOTIFICATION ERROR:', error);

    return res.status(400).json({
      message: 'Failed to send notification.',
      error: error.message,
    });
  }
};

// ==========================================
// MARK AS READ
// PATCH /api/notifications/:id/read
// ==========================================
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to modify this notification.' });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return res.json(notification);
  } catch (error) {
    console.error('MARK AS READ ERROR:', error);

    return res.status(400).json({
      message: 'Failed to update notification status.',
      error: error.message,
    });
  }
};

// ==========================================
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// ==========================================
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.id, isRead: false } }
    );

    return res.json({ message: 'All notifications have been marked as read.' });
  } catch (error) {
    console.error('MARK ALL AS READ ERROR:', error);

    return res.status(500).json({
      message: 'Failed to update notifications.',
      error: error.message,
    });
  }
};

// ==========================================
// DELETE
// DELETE /api/notifications/:id
// ==========================================
exports.remove = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this notification.' });
    }

    await notification.destroy();

    return res.json({ message: 'Notification deleted.' });
  } catch (error) {
    console.error('DELETE NOTIFICATION ERROR:', error);

    return res.status(500).json({
      message: 'An error occurred.',
      error: error.message,
    });
  }
};

// Internal helper (NOT a route) - used by other controllers to send a
// notification directly without going through an HTTP request, e.g.:
//   const { sendNotification } = require('./notificationController');
//   await sendNotification({ userId: request.submittedById, title: 'Request approved',
//     message: 'Your request has been approved.', type: 'success', link: `/applications/${request.id}` });
exports.sendNotification = async ({ userId, title, message, type = 'info', link = null, createdById = null }) => {
  try {
    return await Notification.create({
      userId,
      title,
      message,
      type,
      link,
      createdById,
    });
  } catch (error) {
    console.error('Failed to send notification:', error.message);
    return null;
  }
};