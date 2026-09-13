const fs = require('fs');
const { Op } = require('sequelize');

const {
  Document,
  User,
  sequelize,
} = require('../models');

// ==========================================
// RELATIONS
// ==========================================
const includeRelations = [
  {
    model: User,
    as: 'uploadedBy',
    attributes: ['id', 'fullName', 'email'],
  },
  {
    model: User,
    as: 'approvedBy',
    attributes: ['id', 'fullName', 'email'],
  },
];

// ==========================================
// GET ALL
// GET /api/documents
// ==========================================
exports.getAll = async (req, res) => {
  try {
    const {
      status,
      documentType,
      search = '',
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 20;
    const offset = (pageNumber - 1) * limitNumber;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (documentType) {
      where.documentType = documentType;
    }

    if (search.trim()) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search.trim()}%` } },
        { fileName: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    const { count, rows } = await Document.findAndCountAll({
      where,
      include: includeRelations,
      limit: limitNumber,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      total: count,
      page: pageNumber,
      limit: limitNumber,
      data: rows,
    });
  } catch (error) {
    console.error('GET ALL DOCUMENTS ERROR:', error);

    return res.status(500).json({
      message: 'Failed to retrieve the list of documents.',
      error: error.message,
    });
  }
};

// ==========================================
// GET ONE
// GET /api/documents/:id
// ==========================================
exports.getOne = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: includeRelations,
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    return res.json(document);
  } catch (error) {
    console.error('GET ONE DOCUMENT ERROR:', error);

    return res.status(500).json({
      message: 'An error occurred.',
      error: error.message,
    });
  }
};

// ==========================================
// CREATE (UPLOAD)
// POST /api/documents
// ==========================================
exports.create = async (req, res) => {
  try {
    const { title, documentType, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: 'Please fill in the document title.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Please attach the letter/document/report file.',
      });
    }

    const document = await Document.create({
      title: title.trim(),
      documentType: documentType || 'other',
      description: description ? description.trim() : null,

      uploadedById: req.user.id,

      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,

      status: 'pending',
    });

    const full = await Document.findByPk(document.id, {
      include: includeRelations,
    });

    return res.status(201).json({
      message: 'Document submitted and is awaiting approval.',
      data: full,
    });
  } catch (error) {
    console.error('CREATE DOCUMENT ERROR:', error);

    return res.status(500).json({
      message: 'Failed to submit document.',
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE STATUS (APPROVE / REJECT)
// PATCH /api/documents/:id/status
// ==========================================
exports.updateStatus = async (req, res) => {
  try {
    const { status, approvalComment } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    document.status = status;
    document.approvalComment = approvalComment || null;
    document.approvedById = req.user.id;
    document.reviewedAt = new Date();

    await document.save();

    const full = await Document.findByPk(document.id, {
      include: includeRelations,
    });

    return res.json({
      message:
        status === 'approved'
          ? 'Document has been approved.'
          : status === 'rejected'
          ? 'Document has been rejected.'
          : 'Document status updated.',
      data: full,
    });
  } catch (error) {
    console.error('UPDATE DOCUMENT STATUS ERROR:', error);

    return res.status(400).json({
      message: 'Failed to change document status.',
      error: error.message,
    });
  }
};

// ==========================================
// DELETE
// DELETE /api/documents/:id
// ==========================================
exports.remove = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Delete the actual file from disk (if it exists)
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await document.destroy();

    return res.json({ message: 'Document removed.' });
  } catch (error) {
    console.error('DELETE DOCUMENT ERROR:', error);

    return res.status(500).json({
      message: 'An error occurred.',
      error: error.message,
    });
  }
};

// ==========================================
// STATS
// GET /api/documents/stats/summary
// ==========================================
exports.getStats = async (req, res) => {
  try {
    const total = await Document.count();

    const byStatus = await Document.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
    });

    return res.json({ total, byStatus });
  } catch (error) {
    console.error('GET DOCUMENT STATS ERROR:', error);

    return res.status(500).json({
      message: 'Failed to retrieve document statistics.',
      error: error.message,
    });
  }
};