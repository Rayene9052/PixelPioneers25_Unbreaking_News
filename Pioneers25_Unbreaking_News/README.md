# Histified Backend (Express.js)

Backend autonome pour l'analyse et la vérification de contenus historiques, construit avec Express.js et Node.js.

## Fonctionnalités

- **Détection de contenus générés par IA** : Images, textes, audio
- **Forensique numérique** : ELA, analyse des résidus, extraction de métadonnées
- **Vérification historique** : Bases de données locales et indexées (Elasticsearch)
- **Comparaison perceptuelle** : Détection de variantes et altérations
- **Scoring pondéré** : Évaluation de crédibilité avec traçabilité

## Installation

```bash
npm install
```

## Configuration

Copiez `.env.example` vers `.env` et configurez vos paramètres :

```bash
cp .env.example .env
```

## Démarrage

**Mode développement (avec nodemon) :**
```bash
npm run dev
```

**Mode production :**
```bash
npm start
```

Le serveur démarre sur `http://localhost:8000` par défaut.

## Structure du Projet

```
├── server.js                 # Point d'entrée Express
├── config/                   # Configuration
│   └── database.js          # Configuration Sequelize
├── models/                   # Modèles Sequelize
│   ├── Content.js
│   ├── ContentAnalysis.js
│   ├── ContentMetadata.js
│   ├── Archive.js
│   └── ArchiveEntry.js
├── services/                 # Services métier
│   ├── aiDetection/         # Détection IA
│   ├── forensics/           # Forensique numérique
│   ├── historical/          # Vérification historique
│   ├── scoring/             # Scoring pondéré
│   └── ContentAnalyzer.js   # Orchestrateur principal
└── routes/                   # Routes Express
    ├── content.js
    ├── archives.js
    └── reports.js
```

## API Endpoints

### Contenus

- `POST /api/v1/content/upload` - Upload un fichier
- `POST /api/v1/content/analyze` - Analyser un contenu
- `POST /api/v1/content/upload-and-analyze` - Upload et analyse en une opération
- `GET /api/v1/content/:content_id` - Récupérer un contenu
- `GET /api/v1/content/:content_id/analysis` - Récupérer l'analyse détaillée

### Archives

- `POST /api/v1/archives/` - Créer une archive
- `GET /api/v1/archives/` - Lister les archives
- `POST /api/v1/archives/:archive_id/entries` - Ajouter une entrée
- `GET /api/v1/archives/:archive_id/entries` - Lister les entrées
- `POST /api/v1/archives/search` - Rechercher dans les archives

### Rapports

- `GET /api/v1/reports/content/:content_id` - Générer un rapport complet

## Tests

```bash
# Tous les tests
npm test

# Mode watch
npm run test:watch

# Avec couverture
npm run test:coverage
```

## Technologies Utilisées

- **Express.js** : Framework web
- **Sequelize** : ORM pour PostgreSQL
- **Sharp** : Traitement d'images
- **Elasticsearch** : Recherche et indexation
- **Multer** : Upload de fichiers
- **Jest** : Framework de tests

## Base de Données

Le projet utilise PostgreSQL avec Sequelize. Pour initialiser la base de données :

```bash
# Créer les tables (nécessite une migration Sequelize ou script SQL)
# Les modèles sont définis dans models/
```

## Notes

- Les modèles de détection IA utilisent des heuristiques de base
- Pour la production, remplacez par des modèles ML préentraînés
- Elasticsearch est optionnel mais recommandé pour les recherches d'archives
- Les fichiers uploadés sont stockés dans `./uploads` par défaut

## Licence

MIT
