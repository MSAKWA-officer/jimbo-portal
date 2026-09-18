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

// POST /api/constituents/me
// A logged-in CITIZEN adds their own constituent profile (self-service).
// userId is always taken from the token (req.user.id) - never from the
// request body - so a citizen can never create a profile for someone else.
exports.registerSelf = async (req, res) => {
  try {
    const existing = await Constituent.findOne({ where: { userId: req.user.id } });
    if (existing) {
      return res.status(409).json({ message: 'You already have a constituent profile.', data: existing });
    }

    const { fullName, gender, nationalId, phone, email, region, district, ward, village, dateOfBirth } = req.body;

    if (!fullName) {
      return res.status(400).json({ message: 'Please fill in your full name.' });
    }

    const constituent = await Constituent.create({
      userId: req.user.id,
      fullName,
      gender,
      nationalId,
      phone,
      email,
      region,
      district,
      ward,
      village,
      dateOfBirth,
    });

    res.status(201).json(constituent);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create your constituent profile.', error: error.message });
  }
};

// GET /api/constituents/me
// A logged-in CITIZEN fetches their own constituent profile + their requests.
exports.getMyProfile = async (req, res) => {
  try {
    const constituent = await Constituent.findOne({
      where: { userId: req.user.id },
      include: [{ association: 'requests' }],
    });

    if (!constituent) {
      return res.status(404).json({ message: 'You have not registered a constituent profile yet.' });
    }

    res.json(constituent);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};

// PUT /api/constituents/me
// A logged-in CITIZEN updates their own constituent profile.
exports.updateMyProfile = async (req, res) => {
  try {
    const constituent = await Constituent.findOne({ where: { userId: req.user.id } });
    if (!constituent) {
      return res.status(404).json({ message: 'You have not registered a constituent profile yet.' });
    }

    const { fullName, gender, nationalId, phone, email, region, district, ward, village, dateOfBirth } = req.body;
    await constituent.update({ fullName, gender, nationalId, phone, email, region, district, ward, village, dateOfBirth });

    res.json(constituent);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update your profile.', error: error.message });
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