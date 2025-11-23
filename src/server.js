import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import uploadRoutes from './routes/uploadRoutes.js';
import logger from './config/logger.js';

// Chargement des variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (pour permettre les requêtes depuis le frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Création des dossiers nécessaires
async function setupDirectories() {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const logsDir = './logs';
  
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(logsDir, { recursive: true });
    logger.info(`Dossiers créés: ${uploadDir}, ${logsDir}`);
  } catch (error) {
    logger.error('Erreur lors de la création des dossiers:', error);
  }
}

// Routes
app.use('/api', uploadRoutes);

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'PixelPioneers Backend - Analyse de crédibilité de fichiers',
    version: '1.0.0',
    endpoints: {
      'POST /api/upload-image': 'Upload et analyse d\'une image',
      'POST /api/upload-video': 'Upload et analyse d\'une vidéo',
      'POST /api/upload-pdf': 'Upload et analyse d\'un PDF',
      'GET /api/health': 'État du serveur et des services'
    }
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error('Erreur non gérée:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Démarrage du serveur
async function startServer() {
  await setupDirectories();
  
  app.listen(PORT, () => {
    logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
    logger.info(`📝 Environnement: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`📁 Dossier d'upload: ${process.env.UPLOAD_DIR || './uploads'}`);
    
    // Vérification des clés API
    const requiredEnvVars = [
      'HIVE_ACCESS_KEY',
      'HIVE_SECRET_KEY',
      'SERPAPI_KEY',
      'OPENAI_API_KEY'
    ];
    
    const optionalEnvVars = [
      'HEDERA_ACCOUNT_ID',
      'HEDERA_PRIVATE_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      logger.warn(`⚠️  Variables d'environnement requises manquantes: ${missingVars.join(', ')}`);
      logger.warn('Certaines fonctionnalités peuvent ne pas fonctionner correctement.');
    } else {
      logger.info('✅ Toutes les clés API requises sont configurées');
    }
    
    if (missingOptional.length === optionalEnvVars.length) {
      logger.info('ℹ️  Hedera non configuré - les analyses fonctionneront sans traçabilité blockchain');
    }
  });
}

startServer().catch(error => {
  logger.error('Erreur lors du démarrage du serveur:', error);
  process.exit(1);
});

export default app;

