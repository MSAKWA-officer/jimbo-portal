const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

const {
  Request,
  Constituent,
  RequestCategory,
  User,
  sequelize,
} = require('../models');

const {
  STEPS,
  ensureSteps,
  notifyRoles,
} = require('../utils/approvalHelpers');

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
        'Imeshindwa kupata orodha ya maombi.',
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
        message: 'Ombi halikuonekana.',
      });
    }

    return res.json(request);
  } catch (error) {
    console.error(
      'GET ONE REQUEST ERROR:',
      error
    );

    return res.status(500).json({
      message: 'Hitilafu.',
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
          'Jaza constituentId, categoryId, title na description.',
      });
    }

    // BARUA NI LAZIMA
    if (!req.file) {
      return res.status(400).json({
        message:
          'Tafadhali ambatanisha Barua ya Utambulisho kutoka Serikali za Mitaa.',
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

        // BARUA YA UTAMBULISHO
        identificationLetterPath:
          req.file.path,

        identificationLetterName:
          req.file.originalname,

        identificationLetterUploadedAt:
          new Date(),
      });

    // Start the approval workflow and tell the first-step approvers
    await ensureSteps(request);

    await notifyRoles(STEPS[0].roles, req.user.id, {
      title: 'New application to review',
      message: `${request.trackingNumber} - ${request.title}`,
      type: 'info',
      link: `/applications/${request.id}`,
      createdById: req.user.id,
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
        'Ombi limewasilishwa kwa mafanikio.',
      data: full,
    });
  } catch (error) {
    console.error(
      'CREATE REQUEST ERROR:',
      error
    );

    return res.status(500).json({
      message:
        'Imeshindwa kuwasilisha ombi.',
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
        message: 'Ombi halikuonekana.',
      });
    }

    // Status/tracking number/owner cannot be changed from the edit form
    // (status is managed by the approval workflow)
    const {
      status,
      trackingNumber,
      submittedById,
      ...safe
    } = req.body;

    await request.update(safe);

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
        'Imeshindwa kusasisha ombi.',
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

    if (status !== 'completed') {
      return res.status(400).json({
        message:
          'Approval status is managed by the approval workflow. Only "completed" can be set here.',
      });
    }

    const request =
      await Request.findByPk(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        message: 'Ombi halikuonekana.',
      });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({
        message:
          'Only approved applications can be marked as completed.',
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
        'Imeshindwa kubadili hali ya ombi.',
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
        message: 'Ombi halikuonekana.',
      });
    }

    await request.destroy();

    return res.json({
      message: 'Ombi limeondolewa.',
    });
  } catch (error) {
    console.error(
      'DELETE REQUEST ERROR:',
      error
    );

    return res.status(500).json({
      message: 'Hitilafu.',
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
        'Imeshindwa kupata takwimu za maombi.',
      error: error.message,
    });
  }
};

// ==========================================
// GET LETTER (view the identification letter)
// GET /api/requests/:id/letter
// ==========================================
exports.getLetter = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);

    if (!request || !request.identificationLetterPath) {
      return res.status(404).json({
        message: 'This application has no letter.',
      });
    }

    // Serve only files inside uploads/letters, using the file name only
    const lettersDir = path.resolve(__dirname, '..', 'uploads', 'letters');
    const fileName = path.basename(
      String(request.identificationLetterPath).replace(/\\/g, '/')
    );
    const filePath = path.join(lettersDir, fileName);

    if (!filePath.startsWith(lettersDir) || !fs.existsSync(filePath)) {
      return res.status(404).json({
        message:
          'The letter file was not found on the server. Please upload it again.',
      });
    }

    res.setHeader('Content-Disposition', 'inline');
    return res.sendFile(filePath);
  } catch (error) {
    console.error('GET LETTER ERROR:', error);

    return res.status(500).json({
      message: 'Failed to load the letter.',
    });
  }
};
