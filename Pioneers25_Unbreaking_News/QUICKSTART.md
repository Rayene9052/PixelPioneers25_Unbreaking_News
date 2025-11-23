# Guide de Démarrage Rapide - Histified Backend (Express.js)

## Installation

```bash
# Installer les dépendances
npm install
```

## Configuration

Copiez `.env.example` vers `.env` :
```bash
cp .env.example .env
```

## Démarrage

**Mode développement :**
```bash
npm run dev
```

**Mode production :**
```bash
npm start
```

Le serveur démarre sur `http://localhost:8000`

## Test Rapide

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. Upload et Analyse
```bash
# Upload une image
curl -X POST "http://localhost:8000/api/v1/content/upload" \
  -F "file=@votre_image.jpg"

# Notez le content_id retourné, puis analysez :
curl -X POST "http://localhost:8000/api/v1/content/analyze" \
  -H "Content-Type: application/json" \
  -d '{"content_id": 1}'
```

### 3. Tests Automatisés
```bash
# Tous les tests
npm test

# Mode watch
npm run test:watch

# Avec couverture
npm run test:coverage
```

## Structure

- `server.js` - Point d'entrée Express
- `routes/` - Routes API
- `services/` - Services métier
- `models/` - Modèles Sequelize
- `config/` - Configuration

## API Documentation

Une fois le serveur démarré, testez les endpoints avec :
- Postman
- curl
- Swagger (si configuré)

## Prochaines Étapes

1. ✅ Configurer la base de données PostgreSQL
2. ✅ Configurer Elasticsearch (optionnel)
3. ✅ Tester l'upload et l'analyse
4. 📖 Lire le README.md complet
