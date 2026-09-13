const { Op } = require('sequelize');
const { User } = require('../models');

// GET /api/users?search=&role=&isActive=
exports.getAll = async (req, res) => {
  try {
    const { search = '', role, isActive } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['fullName', 'ASC']],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Imeshindwa kupata orodha ya watumiaji.', error: error.message });
  }
};

// GET /api/users/:id
exports.getOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ message: 'Mtumiaji hakuonekana.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu.', error: error.message });
  }
};

// PUT /api/users/:id
// Kusasisha taarifa za mtumiaji (jina, simu, role, isActive). Password hairekebishwi hapa.
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Mtumiaji hakuonekana.' });

    const { fullName, phone, role, isActive } = req.body;

    await user.update({
      ...(fullName !== undefined ? { fullName } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(role !== undefined ? { role } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    });

    const updated = await User.findByPk(user.id, { attributes: { exclude: ['password'] } });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Imeshindwa kusasisha mtumiaji.', error: error.message });
  }
};

// DELETE /api/users/:id
// Haifuti kabisa - inazima akaunti tu (isActive: false), ili historia
// (audit logs, matendo yaliyofanywa na mtumiaji huyu) isipotee.
exports.remove = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Mtumiaji hakuonekana.' });

    if (req.user?.id === user.id) {
      return res.status(400).json({ message: 'Huwezi kuzima akaunti yako mwenyewe.' });
    }

    await user.update({ isActive: false });
    res.json({ message: 'Akaunti ya mtumiaji imezimwa.' });
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu kuzima akaunti ya mtumiaji.', error: error.message });
  }
};

// userController.js
const bcrypt = require('bcryptjs'); // au bcrypt, kulingana na ulivyotumia kwenye register

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Mtumiaji hakuonekana.' });

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password lazima iwe angalau herufi/namba 6.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });

    res.json({ message: 'Password imebadilishwa.' });
  } catch (error) {
    res.status(500).json({ message: 'Imeshindwa kubadilisha password.', error: error.message });
  }
};
