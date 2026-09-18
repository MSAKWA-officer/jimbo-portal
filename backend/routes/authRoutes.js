const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { protect, optionalAuth } = require('../middleware/auth');

// PUBLIC registration - open to any visitor.
// optionalAuth checks for a token WITHOUT blocking the request if there
// isn't one: a guest registers automatically as 'viewer' (enforced in
// authController.js), while a logged-in admin (token present) can also
// use this same route to add Staff/Secretary/Officer accounts.
router.post('/register', optionalAuth, register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
