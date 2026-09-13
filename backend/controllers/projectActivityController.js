const { ProjectActivity, Project, User } = require('../models');

const includeRelations = [
  { model: Project, as: 'project', attributes: ['id', 'title', 'status'] },
  { model: User, as: 'recordedBy', attributes: ['id', 'fullName', 'email'] },
];

// GET /api/project-activities?projectId=&status=
exports.getAll = async (req, res) => {
  try {
    const { projectId, status } = req.query;

    const where = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const activities = await ProjectActivity.findAll({
      where,
      include: includeRelations,
      order: [['activityDate', 'DESC']],
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve the list of project activities.', error: error.message });
  }
};

// GET /api/project-activities/:id
exports.getOne = async (req, res) => {
  try {
    const activity = await ProjectActivity.findByPk(req.params.id, { include: includeRelations });
    if (!activity) return res.status(404).json({ message: 'Project activity not found.' });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};

// POST /api/project-activities
exports.create = async (req, res) => {
  try {
    const { projectId, title, description, activityDate, status, notes } = req.body;

    if (!projectId || !title || !activityDate) {
      return res.status(400).json({ message: 'projectId, title, and activityDate are required.' });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(400).json({ message: 'The selected project was not found.' });
    }

    const activity = await ProjectActivity.create({
      projectId,
      title,
      description,
      activityDate,
      status: status || 'planned',
      notes,
      recordedById: req.user?.id || null,
    });

    const created = await ProjectActivity.findByPk(activity.id, { include: includeRelations });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add project activity.', error: error.message });
  }
};

// PUT /api/project-activities/:id
exports.update = async (req, res) => {
  try {
    const activity = await ProjectActivity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Project activity not found.' });

    if (req.body.projectId) {
      const project = await Project.findByPk(req.body.projectId);
      if (!project) {
        return res.status(400).json({ message: 'The selected project was not found.' });
      }
    }

    await activity.update(req.body);

    const updated = await ProjectActivity.findByPk(activity.id, { include: includeRelations });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update project activity.', error: error.message });
  }
};

// PATCH /api/project-activities/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const activity = await ProjectActivity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Project activity not found.' });

    const { status } = req.body;
    const validStatuses = ['planned', 'ongoing', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    await activity.update({ status });

    const updated = await ProjectActivity.findByPk(activity.id, { include: includeRelations });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update activity status.', error: error.message });
  }
};

// DELETE /api/project-activities/:id
exports.remove = async (req, res) => {
  try {
    const activity = await ProjectActivity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Project activity not found.' });

    await activity.destroy();
    res.json({ message: 'Project activity removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project activity.', error: error.message });
  }
};