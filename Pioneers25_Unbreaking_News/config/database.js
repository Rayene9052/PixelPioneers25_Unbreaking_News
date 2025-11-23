/**
 * Configuration de la base de données avec Sequelize
 */
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Construire l'URL de connexion
let databaseUrl;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
  databaseUrl = process.env.DATABASE_URL;
} else if (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST && process.env.DB_NAME) {
  const dbPort = process.env.DB_PORT || '5432';
  databaseUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${dbPort}/${process.env.DB_NAME}`;
} else {
  // Fallback vers SQLite pour le développement si aucune config PostgreSQL
  console.warn('⚠️  Aucune configuration PostgreSQL trouvée. Utilisation de SQLite pour le développement.');
  databaseUrl = 'sqlite:./histified.db';
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: databaseUrl.startsWith('sqlite') ? 'sqlite' : 'postgres',
  storage: databaseUrl.startsWith('sqlite') ? './histified.db' : undefined,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: databaseUrl.startsWith('sqlite') ? undefined : {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test de connexion (seulement si pas SQLite)
if (!databaseUrl.startsWith('sqlite')) {
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection established successfully.');
    })
    .catch(err => {
      console.error('❌ Unable to connect to the database:', err.message);
      console.log('💡 Vérifiez votre configuration dans .env');
    });
} else {
  console.log('✅ SQLite database configured for development.');
}

module.exports = sequelize;

