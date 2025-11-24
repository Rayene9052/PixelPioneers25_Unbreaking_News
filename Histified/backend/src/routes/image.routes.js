const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');

// Import both services
const MetadataAnalysisService = require('../services/metadata-analysis.service');
const VisualContentAnalysisService = require('../services/visual-analysis.service');
const ImageVerificationService = require('../services/image-verification.service');
const ImageController = require('../controllers/image.controller');

// Initialize both services
const metadataService = new MetadataAnalysisService();
const visualContentService = new VisualContentAnalysisService();

// Pass both to the main verification service
const verificationService = new ImageVerificationService(
  metadataService,
  visualContentService
);

const imageController = new ImageController(verificationService);

// Routes
router.post('/verify', upload.single('image'), (req, res, next) => {
  imageController.verifyImage(req, res, next);
});

module.exports = router;
