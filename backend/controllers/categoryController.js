const { RequestCategory } = require('../models');

// GET /api/categories
exports.getAll = async (req, res) => {
  try {
    const categories = await RequestCategory.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve categories.', error: error.message });
  }
};

// POST /api/categories
exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required.' });
    const category = await RequestCategory.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add category.', error: error.message });
  }
};

// PUT /api/categories/:id
exports.update = async (req, res) => {
  try {
    const category = await RequestCategory.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    await category.update(req.body);
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update category.', error: error.message });
  }
};

// DELETE /api/categories/:id
exports.remove = async (req, res) => {
  try {
    const category = await RequestCategory.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    await category.destroy();
    res.json({ message: 'Category removed.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};