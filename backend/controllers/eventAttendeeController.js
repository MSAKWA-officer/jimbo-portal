const { Op } = require('sequelize');
const { EventAttendee, Event, Constituent } = require('../models');

const includeRelations = [
  { model: Event, as: 'event', attributes: ['id', 'title', 'eventDate', 'location', 'status', 'capacity'] },
  { model: Constituent, as: 'constituent', attributes: ['id', 'fullName', 'phone', 'email'] },
];

// GET /api/event-attendees?eventId=&status=&search=
exports.getAll = async (req, res) => {
  try {
    const { eventId, status, search = '' } = req.query;

    const where = {};
    if (eventId) where.eventId = eventId;
    if (status) where.attendanceStatus = status;
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const attendees = await EventAttendee.findAll({
      where,
      include: includeRelations,
      order: [['registeredAt', 'DESC']],
    });

    res.json(attendees);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve the list of attendees.', error: error.message });
  }
};

// GET /api/event-attendees/:id
exports.getOne = async (req, res) => {
  try {
    const attendee = await EventAttendee.findByPk(req.params.id, { include: includeRelations });
    if (!attendee) return res.status(404).json({ message: 'Attendee not found.' });
    res.json(attendee);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};

// POST /api/event-attendees
exports.create = async (req, res) => {
  try {
    const {
      eventId,
      constituentId,
      fullName,
      phone,
      email,
      organization,
      attendanceStatus,
      notes,
    } = req.body;

    if (!eventId || !fullName) {
      return res.status(400).json({ message: 'eventId and fullName are required.' });
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Prevent registering the same person (same phone number) twice for one event
    if (phone) {
      const duplicate = await EventAttendee.findOne({ where: { eventId, phone } });
      if (duplicate) {
        return res.status(400).json({
          message: 'A person with this phone number is already registered for this event.',
        });
      }
    }

    // If there is a capacity limit, prevent exceeding it
    if (event.capacity) {
      const currentCount = await EventAttendee.count({
        where: { eventId, attendanceStatus: { [Op.ne]: 'cancelled' } },
      });
      if (currentCount >= event.capacity) {
        return res.status(400).json({
          message: `This event has reached its attendee capacity (${event.capacity}).`,
        });
      }
    }

    const attendee = await EventAttendee.create({
      eventId,
      constituentId: constituentId || null,
      fullName,
      phone,
      email,
      organization,
      attendanceStatus: attendanceStatus || 'registered',
      notes,
    });

    const created = await EventAttendee.findByPk(attendee.id, { include: includeRelations });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Failed to register attendee.', error: error.message });
  }
};

// PUT /api/event-attendees/:id
exports.update = async (req, res) => {
  try {
    const attendee = await EventAttendee.findByPk(req.params.id);
    if (!attendee) return res.status(404).json({ message: 'Attendee not found.' });

    const { fullName, phone, email, organization, constituentId, notes } = req.body;

    await attendee.update({
      ...(fullName !== undefined ? { fullName } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(organization !== undefined ? { organization } : {}),
      ...(constituentId !== undefined ? { constituentId } : {}),
      ...(notes !== undefined ? { notes } : {}),
    });

    const updated = await EventAttendee.findByPk(attendee.id, { include: includeRelations });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update attendee details.', error: error.message });
  }
};

// PATCH /api/event-attendees/:id/status
// Changes the attendance status (registered -> confirmed/attended/absent/cancelled)
// "attended" automatically fills in checkedInAt.
exports.updateStatus = async (req, res) => {
  try {
    const attendee = await EventAttendee.findByPk(req.params.id);
    if (!attendee) return res.status(404).json({ message: 'Attendee not found.' });

    const { attendanceStatus } = req.body;
    const validStatuses = ['registered', 'confirmed', 'attended', 'absent', 'cancelled'];

    if (!validStatuses.includes(attendanceStatus)) {
      return res.status(400).json({ message: 'Invalid attendanceStatus.' });
    }

    await attendee.update({
      attendanceStatus,
      checkedInAt: attendanceStatus === 'attended' ? new Date() : attendee.checkedInAt,
    });

    const updated = await EventAttendee.findByPk(attendee.id, { include: includeRelations });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update attendance status.', error: error.message });
  }
};

// DELETE /api/event-attendees/:id
exports.remove = async (req, res) => {
  try {
    const attendee = await EventAttendee.findByPk(req.params.id);
    if (!attendee) return res.status(404).json({ message: 'Attendee not found.' });

    await attendee.destroy();
    res.json({ message: 'Attendee removed from the event.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove attendee.', error: error.message });
  }
};