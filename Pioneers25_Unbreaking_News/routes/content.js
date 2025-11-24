/**
 * Routes pour l'upload et l'analyse de contenus
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const router = express.Router();

const { Content, ContentAnalysis, ContentMetadata } = require('../models');
const ContentAnalyzer = require('../services/ContentAnalyzer');
const sequelize = require('../config/database');

// Configuration multer pour l'upload
const upload = multer({
  dest: process.env.UPLOAD_DIR || './uploads',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Détecter le type de contenu
function detectContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'];
  const textExts = ['.txt', '.md', '.doc', '.docx', '.pdf'];
  const audioExts = ['.mp3', '.wav', '.flac', '.aac', '.ogg'];

  if (imageExts.includes(ext)) return 'image';
  if (textExts.includes(ext)) return 'text';
  if (audioExts.includes(ext)) return 'audio';
  return 'unknown';
}

// POST /api/v1/content/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const contentType = detectContentType(req.file.originalname);
    if (contentType === 'unknown') {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Type de fichier non supporté' });
    }

    // Générer un nom de fichier unique
    const fileExt = path.extname(req.file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExt}`;
    const newPath = path.join(process.env.UPLOAD_DIR || './uploads', uniqueFilename);

    // Renommer le fichier
    await fs.rename(req.file.path, newPath);

    // Créer l'entrée en base de données
    const content = await Content.create({
      filename: req.file.originalname,
      filePath: newPath,
      contentType: contentType,
      fileSize: req.file.size
    });

    res.json({
      content_id: content.id,
      filename: content.filename,
      content_type: content.contentType,
      status: 'uploaded'
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erreur lors de l\'upload', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/v1/content/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { content_id, metadata } = req.body;

    if (!content_id) {
      return res.status(400).json({ error: 'content_id requis' });
    }

    // Récupérer le contenu
    const content = await Content.findByPk(content_id);
    if (!content) {
      return res.status(404).json({ 
        error: 'Contenu non trouvé',
        message: `Aucun contenu trouvé avec l'ID ${content_id}`,
        hint: 'Assurez-vous d\'avoir uploadé un fichier et d\'utiliser le content_id retourné par /upload'
      });
    }

    // Vérifier que le fichier existe
    try {
      await fs.access(content.filePath);
    } catch {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Analyser
    const analyzer = new ContentAnalyzer(sequelize);
    const analysisResults = await analyzer.analyze(
      content.filePath,
      content.contentType,
      metadata
    );

    // Sauvegarder les résultats
    const analysis = await analyzer.saveAnalysis(content.id, analysisResults.analysisResults);

    // Sauvegarder les métadonnées si disponibles
    if (analysisResults.analysisResults.metadata) {
      const metadataData = analysisResults.analysisResults.metadata;
      let contentMetadata = await ContentMetadata.findOne({ where: { contentId: content.id } });

      if (contentMetadata) {
        await contentMetadata.update({
          exifData: metadataData.exifData,
          creationDate: metadataData.creationDate ? new Date(metadataData.creationDate) : null,
          modificationDate: metadataData.modificationDate ? new Date(metadataData.modificationDate) : null,
          dimensions: metadataData.dimensions,
          formatInfo: metadataData.formatInfo
        });
      } else {
        await ContentMetadata.create({
          contentId: content.id,
          exifData: metadataData.exifData,
          creationDate: metadataData.creationDate ? new Date(metadataData.creationDate) : null,
          modificationDate: metadataData.modificationDate ? new Date(metadataData.modificationDate) : null,
          dimensions: metadataData.dimensions,
          formatInfo: metadataData.formatInfo
        });
      }
    }

    res.json({
      content_id: content.id,
      analysis_id: analysis.id,
      summary: analysisResults.summary,
      status: 'completed'
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
    res.status(500).json({ error: 'Erreur lors de l\'analyse', message: error.message });
  }
});

// POST /api/v1/content/upload-and-analyze
router.post('/upload-and-analyze', upload.single('file'), async (req, res) => {
  try {
    // D'abord uploader
    const uploadReq = { ...req, body: { ...req.body } };
    const uploadRes = { json: (data) => data, status: (code) => ({ json: (data) => ({ ...data, statusCode: code }) }) };
    
    // Simuler l'upload
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const contentType = detectContentType(req.file.originalname);
    if (contentType === 'unknown') {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Type de fichier non supporté' });
    }

    const fileExt = path.extname(req.file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExt}`;
    const newPath = path.join(process.env.UPLOAD_DIR || './uploads', uniqueFilename);
    await fs.rename(req.file.path, newPath);

    const content = await Content.create({
      filename: req.file.originalname,
      filePath: newPath,
      contentType: contentType,
      fileSize: req.file.size
    });

    // Ensuite analyser
    const analyzer = new ContentAnalyzer(sequelize);
    const analysisResults = await analyzer.analyze(newPath, contentType, req.body.metadata);
    const analysis = await analyzer.saveAnalysis(content.id, analysisResults.analysisResults);

    res.json({
      content_id: content.id,
      analysis_id: analysis.id,
      summary: analysisResults.summary,
      status: 'completed'
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur', message: error.message });
  }
});

// GET /api/v1/content/:content_id
router.get('/:content_id', async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.content_id, {
      include: [
        {
          model: ContentAnalysis,
          as: 'analyses',
          limit: 1,
          order: [['analysisDate', 'DESC']]
        }
      ]
    });

    if (!content) {
      return res.status(404).json({ error: 'Contenu non trouvé' });
    }

    const latestAnalysis = content.analyses && content.analyses.length > 0 ? content.analyses[0] : null;

    res.json({
      id: content.id,
      filename: content.filename,
      content_type: content.contentType,
      upload_date: content.uploadDate,
      analysis: latestAnalysis ? {
        id: latestAnalysis.id,
        credibility_score: latestAnalysis.credibilityScore,
        manipulation_probability: latestAnalysis.manipulationProbability,
        analysis_date: latestAnalysis.analysisDate
      } : null
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur', message: error.message });
  }
});

// GET /api/v1/content/:content_id/analysis
router.get('/:content_id/analysis', async (req, res) => {
  try {
    const analysis = await ContentAnalysis.findOne({
      where: { contentId: req.params.content_id },
      order: [['analysisDate', 'DESC']]
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analyse non trouvée' });
    }

    res.json({
      analysis_id: analysis.id,
      content_id: analysis.contentId,
      ai_detection_score: analysis.aiDetectionScore,
      ai_detection_confidence: analysis.aiDetectionConfidence,
      ela_score: analysis.elaScore,
      residual_analysis_score: analysis.residualAnalysisScore,
      metadata_consistency_score: analysis.metadataConsistencyScore,
      historical_match_score: analysis.historicalMatchScore,
      variant_detection_score: analysis.variantDetectionScore,
      alteration_detection_score: analysis.alterationDetectionScore,
      credibility_score: analysis.credibilityScore,
      manipulation_probability: analysis.manipulationProbability,
      analysis_details: analysis.analysisDetails,
      analysis_date: analysis.analysisDate
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur', message: error.message });
  }
});

module.exports = router;

