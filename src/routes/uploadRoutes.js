import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import AnalysisService from '../services/analysisService.js';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB par défaut
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'video/avi': ['.avi'],
      'video/mov': ['.mov'],
      'video/quicktime': ['.mov'],
      'application/pdf': ['.pdf']
    };

    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    if (allowedTypes[mimeType] && allowedTypes[mimeType].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non supporté: ${mimeType}. Extensions autorisées: ${Object.values(allowedTypes).flat().join(', ')}`));
    }
  }
});

// Initialisation du service d'analyse
const analysisService = new AnalysisService({
  hiveAccessKey: process.env.HIVE_ACCESS_KEY,
  hiveSecretKey: process.env.HIVE_SECRET_KEY,
  serpApiKey: process.env.SERPAPI_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  hederaAccountId: process.env.HEDERA_ACCOUNT_ID,
  hederaPrivateKey: process.env.HEDERA_PRIVATE_KEY,
  hederaNetwork: process.env.HEDERA_NETWORK || 'testnet'
});

/**
 * Route POST /upload-image
 * Upload et analyse d'une image
 */
router.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Aucun fichier image fourni'
    });
  }

  logger.info(`Upload d'image reçu: ${req.file.filename}`);

  try {
    const analysisResult = await analysisService.analyzeImage(req.file.path);

    res.json({
      success: true,
      data: analysisResult
    });
  } catch (error) {
    logger.error('Erreur lors de l\'analyse d\'image:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Route POST /upload-video
 * Upload et analyse d'une vidéo
 */
router.post('/upload-video', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Aucun fichier vidéo fourni'
    });
  }

  logger.info(`Upload de vidéo reçu: ${req.file.filename}`);

  try {
    const analysisResult = await analysisService.analyzeVideo(req.file.path);

    res.json({
      success: true,
      data: analysisResult
    });
  } catch (error) {
    logger.error('Erreur lors de l\'analyse de vidéo:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Route POST /upload-pdf
 * Upload et analyse d'un PDF
 */
router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Aucun fichier PDF fourni'
    });
  }

  logger.info(`Upload de PDF reçu: ${req.file.filename}`);

  try {
    const analysisResult = await analysisService.analyzePDF(req.file.path);

    res.json({
      success: true,
      data: analysisResult
    });
  } catch (error) {
    logger.error('Erreur lors de l\'analyse de PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Route GET /health
 * Vérification de l'état du serveur
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      hive: !!(process.env.HIVE_ACCESS_KEY && process.env.HIVE_SECRET_KEY),
      serpapi: !!process.env.SERPAPI_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      hedera: !!(process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY)
    }
  });
});

export default router;

