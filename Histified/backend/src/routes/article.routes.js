const express = require('express');
const router = express.Router();
const multer = require('multer');

const PDFExtractionService = require('../services/pdf-extraction.service');
const ArticleAnalysisService = require('../services/article-analysis.service');
const ArticleVerificationService = require('../services/article-verification.service');
const ArticleController = require('../controllers/article.controller');

// Multer configuration for PDF
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Initialize services
const pdfExtractionService = new PDFExtractionService();
const articleAnalysisService = new ArticleAnalysisService();
const verificationService = new ArticleVerificationService(
  pdfExtractionService,
  articleAnalysisService
);

const articleController = new ArticleController(verificationService);

// Route
router.post('/verify', upload.single('article'), (req, res, next) => {
  articleController.verifyArticle(req, res, next);
});

module.exports = router;
