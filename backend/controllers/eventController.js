const { Op } = require('sequelize');
const { Event, EventAttendee, User } = require('../models');

const includeRelations = [
  { model: User, as: 'organizer', attributes: ['id', 'fullName', 'email'] },
];

// GET /api/events?search=&status=
exports.getAll = async (req, res) => {
  try {
    const { search = '', status } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;

    const events = await Event.findAll({
      where,
      include: includeRelations,
      order: [['eventDate', 'DESC']],
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Imeshindwa kupata orodha ya matukio.', error: error.message });
  }
};

// GET /api/events/:id
exports.getOne = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        ...includeRelations,
        { association: 'attendees' },
      ],
    });
    if (!event) return res.status(404).json({ message: 'Tukio halikuonekana.' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu.', error: error.message });
  }
};

// POST /api/events
exports.create = async (req, res) => {
  try {
    const { title, description, eventDate, startTime, endTime, location, capacity, notes, status } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({ message: 'title na eventDate vinahitajika.' });
    }

    const event = await Event.create({
      title,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      capacity,
      notes,
      status: status || 'scheduled',
      organizerId: req.user?.id || null,
    });

    const created = await Event.findByPk(event.id, { include: includeRelations });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Imeshindwa kuongeza tukio.', error: error.message });
  }
};

// PUT /api/events/:id
exports.update = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Tukio halikuonekana.' });

    await event.update(req.body);

    const updated = await Event.findByPk(event.id, { include: includeRelations });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Imeshindwa kusasisha tukio.', error: error.message });
  }
};

// DELETE /api/events/:id
exports.remove = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Tukio halikuonekana.' });

    // Futa kwanza wahudhuriaji wa tukio hili ili kuepuka hitilafu ya foreign key
    await EventAttendee.destroy({ where: { eventId: event.id } });
    await event.destroy();

    res.json({ message: 'Tukio na wahudhuriaji wake wameondolewa.' });
  } catch (error) {
    res.status(500).json({ message: 'Hitilafu kufuta tukio.', error: error.message });
  }
};
