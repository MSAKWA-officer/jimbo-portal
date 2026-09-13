const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Kuongeza mtumiaji mpya (register) ni kazi ya admin pekee - la sivyo mtu
// yeyote asiye na akaunti angeweza kujiandikisha akiwa role: 'admin'.
router.post('/register', protect, authorize('admin'), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
