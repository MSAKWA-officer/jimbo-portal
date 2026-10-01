// ------------------------------------------------------------------
// ADD to backend/controllers/requestController.js
// (needs these two requires at the top of that file)
// ------------------------------------------------------------------
const fs = require('fs');
const path = require('path');

// GET /api/requests/:id/letter
exports.getLetter = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);

    if (!request || !request.identificationLetterPath) {
      return res.status(404).json({ message: 'This application has no letter.' });
    }

    const stored = String(request.identificationLetterPath);
    const lettersDir = path.join(__dirname, '..', 'uploads', 'letters');

    // Try the stored path first, then fall back to the file name inside uploads/letters
    const candidates = [
      stored,
      path.join(lettersDir, path.basename(stored.replace(/\\/g, '/'))),
    ];
    const filePath = candidates.find((p) => fs.existsSync(p));

    if (!filePath) {
      return res.status(404).json({
        message: 'The letter file was not found on the server. Please upload it again.',
      });
    }

    res.setHeader('Content-Disposition', 'inline');
    return res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('GET LETTER ERROR:', error);
    return res.status(500).json({ message: 'Failed to load the letter.' });
  }
};
