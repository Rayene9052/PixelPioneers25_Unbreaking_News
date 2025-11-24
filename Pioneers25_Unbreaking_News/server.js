/**
 * Serveur Express principal pour Histified Backend
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Créer les dossiers nécessaires
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const archiveDir = process.env.ARCHIVE_DIR || './archives';

[uploadDir, archiveDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Dossier créé: ${dir}`);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const contentRoutes = require('./routes/content');
const archivesRoutes = require('./routes/archives');
const reportsRoutes = require('./routes/reports');

app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/archives', archivesRoutes);
app.use('/api/v1/reports', reportsRoutes);

// Routes de base
app.get('/', (req, res) => {
  res.json({
    message: 'Histified Backend API',
    version: '1.0.0',
    status: 'operational'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 8002;

app.listen(PORT, () => {
  console.log(`Histified Backend running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api/v1`);
});

module.exports = app;

