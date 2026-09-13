const { Op } = require('sequelize');
const { Project, RequestCategory, Constituent, User } = require('../models');

const includeRelations = [
  { model: RequestCategory, as: 'category', attributes: ['id', 'name'] },
  { model: Constituent, as: 'constituent', attributes: ['id', 'fullName', 'ward', 'village'] },
  { model: User, as: 'manager', attributes: ['id', 'fullName', 'email'] },
];

// GET /api/projects?search=&status=&categoryId=
exports.getAll = async (req, res) => {
  try {
    const { search = '', status, categoryId } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    const projects = await Project.findAll({
      where,
      include: includeRelations,
      order: [['createdAt', 'DESC']],
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve the list of projects.', error: error.message });
  }
};

// GET /api/projects/:id
exports.getOne = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, { include: includeRelations });
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};

// POST /api/projects
exports.create = async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      constituentId,
      location,
      status,
      startDate,
      endDate,
      estimatedCost,
      actualCost,
      progressPercentage,
      notes,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'title is required.' });
    }

    const project = await Project.create({
      title,
      description,
      categoryId: categoryId || null,
      constituentId: constituentId || null,
      location,
      status: status || 'planned',
      startDate: startDate || null,
      endDate: endDate || null,
      estimatedCost: estimatedCost || null,
      actualCost: actualCost || 0,
      progressPercentage: progressPercentage || 0,
      notes,
      managerId: req.user?.id || null,
    });

    const created = await Project.findByPk(project.id, { include: includeRelations });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add project.', error: error.message });
  }
};

// PUT /api/projects/:id
exports.update = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    await project.update(req.body);

    const updated = await Project.findByPk(project.id, { include: includeRelations });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update project.', error: error.message });
  }
};

// PATCH /api/projects/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const { status } = req.body;
    const validStatuses = ['planned', 'ongoing', 'completed', 'on_hold', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    await project.update({ status });

    const updated = await Project.findByPk(project.id, { include: includeRelations });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update project status.', error: error.message });
  }
};

// DELETE /api/projects/:id
exports.remove = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    await project.destroy();
    res.json({ message: 'Project removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project.', error: error.message });
  }
};