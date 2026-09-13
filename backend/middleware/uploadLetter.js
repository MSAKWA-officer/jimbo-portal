const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'letters');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const fileName =
      `letter-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    cb(null, fileName);
  },
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Barua lazima iwe PDF, JPG au PNG.'));
  }
};

const uploadLetter = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = uploadLetter;