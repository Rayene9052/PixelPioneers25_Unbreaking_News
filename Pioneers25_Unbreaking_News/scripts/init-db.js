/**
 * Script d'initialisation de la base de données
 * Crée toutes les tables nécessaires
 */
require('dotenv').config();
const sequelize = require('../config/database');
const { Content, ContentAnalysis, ContentMetadata, Archive, ArchiveEntry } = require('../models');

async function initDatabase() {
  try {
    console.log('🔄 Initialisation de la base de données...');
    
    // Synchroniser les modèles avec la base de données
    // force: false = ne pas supprimer les tables existantes
    // alter: true = modifier les tables existantes si nécessaire
    await sequelize.sync({ alter: true });
    
    console.log('✅ Base de données initialisée avec succès!');
    console.log('📊 Tables créées:');
    console.log('   - contents');
    console.log('   - content_analyses');
    console.log('   - content_metadata');
    console.log('   - archives');
    console.log('   - archive_entries');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

initDatabase();

