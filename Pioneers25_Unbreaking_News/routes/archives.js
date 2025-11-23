/**
 * Routes pour la gestion des archives historiques
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const router = express.Router();

const { Archive, ArchiveEntry } = require('../models');
const ArchiveManager = require('../services/historical/ArchiveManager');
const sequelize = require('../config/database');

const upload = multer({
  dest: process.env.ARCHIVE_DIR || './archives'
});

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

// POST /api/v1/archives/
router.post('/', async (req, res) => {
  try {
    const { name, description, source } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name requis' });
    }

    const manager = new ArchiveManager(sequelize);
    const archive = await manager.createArchive(name, description, source);

    res.json({
      id: archive.id,
      name: archive.name,
      description: archive.description,
      source: archive.source
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur', message: error.message });
  }
});

// GET /api/v1/archives/
router.get('/', async (req, res) => {
  try {
    const archives = await Archive.findAll();
    res.json(archives.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      source: a.source,
      created_date: a.createdDate
    })));
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur', message: error.message });
  }
});

// POST /api/v1/archives/:archive_id/entries
router.post('/:archive_id/entries', upload.single('file'), async (req, res) => {
  try {
    const archiveId = parseInt(req.params.archive_id);
    const archive = await Archive.findByPk(archiveId);

    if (!archive) {
      return res.status(404).json({ error: 'Archive non trouvée' });
    }

    let filePath = null;
    let contentType = null;

    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      contentType = detectContentType(req.file.originalname);
      const uniqueFilename = `${uuidv4()}${fileExt}`;
      filePath = path.join(process.env.ARCHIVE_DIR || './archives', uniqueFilename);
      await fs.rename(req.file.path, filePath);
    }

    const { title, description, historical_date, location, source_reference, tags, metadata } = req.body;

    const manager = new ArchiveManager(sequelize);
    const entry = await manager.addEntry(archiveId, {
      title,
      description,
      contentType: contentType || 'unknown',
      filePath,
      historicalDate: historical_date ? new Date(historical_date) : null,
      location,
      sourceReference: source_reference,
      validationStatus: 'validated',
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : null,
      metadata: metadata ? (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) : null
    });

    res.json({
      id: entry.id,
      archive_id: entry.archiveId,
      title: entry.title,
      historical_date: entry.historicalDate,
      status: 'created'
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur', message: error.message });
  }
});

// GET /api/v1/archives/:archive_id/entries
router.get('/:archive_id/entries', async (req, res) => {
  try {
    const entries = await ArchiveEntry.findAll({
      where: { archiveId: req.params.archive_id }
    });

    res.json(entries.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      content_type: e.contentType,
      historical_date: e.historicalDate,
      location: e.location,
      validation_status: e.validationStatus
    })));
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur', message: error.message });
  }
});

// POST /api/v1/archives/search
router.post('/search', async (req, res) => {
  try {
    const manager = new ArchiveManager(sequelize);
    const results = await manager.searchSimilar(req.body);

    res.json({
      results: results,
      count: results.length
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur', message: error.message });
  }
});

module.exports = router;

