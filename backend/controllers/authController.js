const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route POST /api/auth/register
// PUBLIC registration (no login required) - for CITIZENS only.
// If the request comes from a logged-in admin (req.user is set by
// optionalAuth in authRoutes.js), only that admin is allowed to choose a
// role (e.g. Staff/Secretary/Officer - all currently stored as the 'staff'
// role for now) - otherwise the role is set to 'citizen' automatically,
// regardless of what the visitor submitted in their request.
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please fill in name, email, and password.' });
    }

    const isAdminCreating = req.user && req.user.role === 'admin';

    let role;
    if (isAdminCreating) {
      const validRoles = ['admin', 'staff', 'secretary', 'officer', 'citizen'];
      role = validRoles.includes(req.body.role) ? req.body.role : 'staff';
    } else {
      // Security: the role of a non-logged-in visitor can NEVER come from
      // their request - it is always 'citizen', even if they tried to submit
      // something else.
      role = 'citizen';
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      phone,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: isAdminCreating
        ? 'New user added successfully.'
        : 'Registration successful.',
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during registration.', error: error.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill in email and password.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Logged in successfully.',
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during login.', error: error.message });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

// @route PUT /api/auth/change-password
// A logged-in user changes their own password.
// They must first confirm their current password.
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please fill in the current password and the new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'The new password must be at least 6 characters/digits.' });
    }

    // req.user was already set by the protect middleware
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'The current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while changing the password.', error: error.message });
  }
};