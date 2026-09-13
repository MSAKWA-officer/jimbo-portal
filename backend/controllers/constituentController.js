const { Op } = require('sequelize');
const { Constituent } = require('../models');

// GET /api/constituents?search=&page=&limit=
exports.getAll = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = search
      ? {
          [Op.or]: [
            { fullName: { [Op.iLike]: `%${search}%` } },
            { phone: { [Op.iLike]: `%${search}%` } },
            { nationalId: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Constituent.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({ total: count, page: parseInt(page), data: rows });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve the list of constituents.', error: error.message });
  }
};

// GET /api/constituents/:id
exports.getOne = async (req, res) => {
  try {
    const constituent = await Constituent.findByPk(req.params.id, {
      include: [{ association: 'requests' }],
    });
    if (!constituent) return res.status(404).json({ message: 'Constituent not found.' });
    res.json(constituent);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};

// POST /api/constituents
exports.create = async (req, res) => {
  try {
    const constituent = await Constituent.create(req.body);
    res.status(201).json(constituent);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add constituent.', error: error.message });
  }
};

// PUT /api/constituents/:id
exports.update = async (req, res) => {
  try {
    const constituent = await Constituent.findByPk(req.params.id);
    if (!constituent) return res.status(404).json({ message: 'Constituent not found.' });
    await constituent.update(req.body);
    res.json(constituent);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update details.', error: error.message });
  }
};

// DELETE /api/constituents/:id
exports.remove = async (req, res) => {
  try {
    const constituent = await Constituent.findByPk(req.params.id);
    if (!constituent) return res.status(404).json({ message: 'Constituent not found.' });
    await constituent.destroy();
    res.json({ message: 'Constituent removed.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};