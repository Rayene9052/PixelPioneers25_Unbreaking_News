# Configuration de l'environnement

## Fichier .env

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Server
PORT=8000
NODE_ENV=development

# Database
# Option 1: Utiliser DATABASE_URL (recommandé)
DATABASE_URL=postgresql://user:password@localhost:5432/histified_db

# Option 2: Utiliser les variables individuelles
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=histified_db
# DB_USER=user
# DB_PASSWORD=password

# Note: Si aucune configuration PostgreSQL n'est fournie, SQLite sera utilisé automatiquement

# Redis (optionnel)
REDIS_URL=redis://localhost:6379/0

# Elasticsearch (optionnel)
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX=histified_content

# Storage
UPLOAD_DIR=./uploads
ARCHIVE_DIR=./archives
MODELS_DIR=./models

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8080

# Security
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET=your-jwt-secret-change-in-production
```

## Mode Développement (SQLite)

Si vous n'avez pas PostgreSQL configuré, le système utilisera automatiquement SQLite. Aucune configuration supplémentaire n'est nécessaire - le fichier `histified.db` sera créé automatiquement.

## Mode Production (PostgreSQL)

Pour utiliser PostgreSQL en production :

1. Installez PostgreSQL
2. Créez une base de données : `CREATE DATABASE histified_db;`
3. Configurez `DATABASE_URL` dans `.env` avec vos identifiants

