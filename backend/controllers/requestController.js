const { Op } = require('sequelize');

const {
  Request,
  Constituent,
  RequestCategory,
  User,
  sequelize,
} = require('../models');

// ==========================================
// GENERATE TRACKING NUMBER
// ==========================================
const generateTrackingNumber = async () => {
  const year = new Date().getFullYear();

  const count = await Request.count();

  const nextNumber = (count + 1)
    .toString()
    .padStart(6, '0');

  return `REQ-${year}-${nextNumber}`;
};

// ==========================================
// RELATIONS
// ==========================================
const includeRelations = [
  {
    model: Constituent,
    as: 'constituent',
  },
  {
    model: RequestCategory,
    as: 'category',
  },
  {
    model: User,
    as: 'submittedBy',
    attributes: ['id', 'fullName', 'email'],
  },
];

// ==========================================
// GET ALL
// GET /api/requests
// ==========================================
exports.getAll = async (req, res) => {
  try {
    const {
      status,
      categoryId,
      constituentId,
      search = '',
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 20;

    const offset =
      (pageNumber - 1) * limitNumber;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (constituentId) {
      where.constituentId = constituentId;
    }

    if (search.trim()) {
      where[Op.or] = [
        {
          title: {
            [Op.iLike]: `%${search.trim()}%`,
          },
        },
        {
          trackingNumber: {
            [Op.iLike]: `%${search.trim()}%`,
          },
        },
      ];
    }

    const { count, rows } =
      await Request.findAndCountAll({
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
    console.error(
      'GET ALL REQUESTS ERROR:',
      error
    );

    return res.status(500).json({
      message:
        'Failed to retrieve the list of requests.',
      error: error.message,
    });
  }
};

// ==========================================
// GET ONE
// GET /api/requests/:id
// ==========================================
exports.getOne = async (req, res) => {
  try {
    const request =
      await Request.findByPk(
        req.params.id,
        {
          include: includeRelations,
        }
      );

    if (!request) {
      return res.status(404).json({
        message: 'Request not found.',
      });
    }

    return res.json(request);
  } catch (error) {
    console.error(
      'GET ONE REQUEST ERROR:',
      error
    );

    return res.status(500).json({
      message: 'An error occurred.',
      error: error.message,
    });
  }
};

// ==========================================
// CREATE
// POST /api/requests
// ==========================================
exports.create = async (req, res) => {
  try {
    const {
      constituentId,
      categoryId,
      title,
      description,
      priority,
    } = req.body;

    if (
      !constituentId ||
      !categoryId ||
      !title ||
      !description
    ) {
      return res.status(400).json({
        message:
          'Please fill in constituentId, categoryId, title, and description.',
      });
    }

    // THE IDENTIFICATION LETTER IS REQUIRED
    if (!req.file) {
      return res.status(400).json({
        message:
          'Please attach an Identification Letter from the Local Government.',
      });
    }

    const trackingNumber =
      await generateTrackingNumber();

    const request =
      await Request.create({
        trackingNumber,

        constituentId,

        categoryId,

        title: title.trim(),

        description: description.trim(),

        priority: priority || 'medium',

        submittedById: req.user.id,

        // IDENTIFICATION LETTER
        identificationLetterPath:
          req.file.path,

        identificationLetterName:
          req.file.originalname,

        identificationLetterUploadedAt:
          new Date(),
      });

    const full =
      await Request.findByPk(
        request.id,
        {
          include: includeRelations,
        }
      );

    return res.status(201).json({
      message:
        'Request submitted successfully.',
      data: full,
    });
  } catch (error) {
    console.error(
      'CREATE REQUEST ERROR:',
      error
    );

    return res.status(500).json({
      message:
        'Failed to submit request.',
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE
// PUT /api/requests/:id
// ==========================================
exports.update = async (req, res) => {
  try {
    const request =
      await Request.findByPk(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        message: 'Request not found.',
      });
    }

    await request.update(req.body);

    const full =
      await Request.findByPk(
        request.id,
        {
          include: includeRelations,
        }
      );

    return res.json(full);
  } catch (error) {
    console.error(
      'UPDATE REQUEST ERROR:',
      error
    );

    return res.status(400).json({
      message:
        'Failed to update request.',
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE STATUS
// PATCH /api/requests/:id/status
// ==========================================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      'pending',
      'in_review',
      'approved',
      'rejected',
      'completed',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          'Invalid status.',
      });
    }

    const request =
      await Request.findByPk(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        message: 'Request not found.',
      });
    }

    request.status = status;

    if (status === 'completed') {
      request.resolvedAt = new Date();
    } else {
      request.resolvedAt = null;
    }

    await request.save();

    const full =
      await Request.findByPk(
        request.id,
        {
          include: includeRelations,
        }
      );

    return res.json(full);
  } catch (error) {
    console.error(
      'UPDATE STATUS ERROR:',
      error
    );

    return res.status(400).json({
      message:
        'Failed to change request status.',
      error: error.message,
    });
  }
};

// ==========================================
// DELETE
// DELETE /api/requests/:id
// ==========================================
exports.remove = async (req, res) => {
  try {
    const request =
      await Request.findByPk(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        message: 'Request not found.',
      });
    }

    await request.destroy();

    return res.json({
      message: 'Request removed.',
    });
  } catch (error) {
    console.error(
      'DELETE REQUEST ERROR:',
      error
    );

    return res.status(500).json({
      message: 'An error occurred.',
      error: error.message,
    });
  }
};

// ==========================================
// STATS
// GET /api/requests/stats/summary
// ==========================================
exports.getStats = async (req, res) => {
  try {
    const total =
      await Request.count();

    const byStatus =
      await Request.findAll({
        attributes: [
          'status',
          [
            sequelize.fn(
              'COUNT',
              sequelize.col('id')
            ),
            'count',
          ],
        ],
        group: ['status'],
      });

    return res.json({
      total,
      byStatus,
    });
  } catch (error) {
    console.error(
      'GET STATS ERROR:',
      error
    );

    return res.status(500).json({
      message:
        'Failed to retrieve request statistics.',
      error: error.message,
    });
  }
};