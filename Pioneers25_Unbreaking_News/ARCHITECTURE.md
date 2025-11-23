# Architecture du Backend Histified (Express.js)

## Vue d'ensemble

Le backend Histified est conçu pour analyser et vérifier de manière autonome les contenus historiques. Il combine plusieurs techniques de détection et de vérification pour évaluer la crédibilité des contenus.

## Structure du projet

```
├── server.js                 # Point d'entrée Express
├── config/                   # Configuration
│   └── database.js          # Configuration Sequelize
├── models/                   # Modèles Sequelize
│   ├── Content.js
│   ├── ContentAnalysis.js
│   ├── ContentMetadata.js
│   ├── Archive.js
│   ├── ArchiveEntry.js
│   └── index.js
├── services/                 # Services métier
│   ├── ContentAnalyzer.js   # Orchestrateur principal
│   ├── aiDetection/         # Détection de contenus générés par IA
│   │   ├── ImageDetector.js
│   │   ├── TextDetector.js
│   │   └── AudioDetector.js
│   ├── forensics/           # Forensique numérique
│   │   ├── ELAAnalyzer.js
│   │   ├── ResidualAnalyzer.js
│   │   └── MetadataExtractor.js
│   ├── historical/          # Vérification historique
│   │   ├── HistoricalVerifier.js
│   │   ├── ArchiveManager.js
│   │   └── PerceptualComparator.js
│   └── scoring/             # Scoring pondéré
│       └── CredibilityScorer.js
└── routes/                   # Routes Express
    ├── content.js
    ├── archives.js
    └── reports.js
```

## Modules principaux

### 1. Détection de contenus générés par IA

**ImageDetector** : Analyse les images pour détecter si elles sont générées par IA
- Analyse de variance
- Analyse des gradients
- Analyse de texture
- Utilise Sharp pour le traitement d'images

**TextDetector** : Analyse les textes pour détecter la génération par IA
- Diversité lexicale
- Répétitions
- Patterns typiques des IA
- Cohérence structurelle

**AudioDetector** : Analyse les fichiers audio (placeholder pour implémentation future)

### 2. Forensique numérique

**ELAAnalyzer** : Error Level Analysis
- Recompression JPEG pour détecter les manipulations
- Analyse des erreurs de compression
- Détection de zones suspectes
- Utilise Sharp pour le traitement

**ResidualAnalyzer** : Analyse des résidus
- Pattern de bruit
- Artefacts de compression
- Anomalies statistiques

**MetadataExtractor** : Extraction et vérification de métadonnées
- Extraction EXIF (images) avec exif-parser
- Vérification de cohérence
- Détection d'incohérences

### 3. Vérification historique

**HistoricalVerifier** : Compare les contenus avec les archives
- Recherche dans Elasticsearch
- Comparaison perceptuelle
- Vérification de chronologie

**ArchiveManager** : Gestion des archives historiques
- Indexation dans Elasticsearch
- Recherche par date, localisation, tags
- Gestion des entrées validées

**PerceptualComparator** : Comparaison perceptuelle
- SSIM (Structural Similarity Index) simplifié
- Détection de variantes
- Détection d'altérations

### 4. Scoring pondéré

**CredibilityScorer** : Calcule un score de crédibilité final
- Poids configurables par composante
- Score de manipulation
- Breakdown détaillé

## Flux d'analyse

1. **Upload** : Le fichier est uploadé via Multer et sauvegardé
2. **Détection IA** : Analyse pour détecter la génération par IA
3. **Forensique** : Analyse ELA, résidus, métadonnées
4. **Vérification historique** : Recherche dans les archives
5. **Comparaison** : Comparaison avec les entrées similaires
6. **Scoring** : Calcul du score de crédibilité pondéré
7. **Rapport** : Génération d'un rapport complet

## Base de données

### Tables principales (Sequelize/PostgreSQL)

- **contents** : Fichiers uploadés
- **content_analyses** : Résultats d'analyse
- **content_metadata** : Métadonnées extraites
- **archives** : Collections d'archives
- **archive_entries** : Entrées dans les archives

## Indexation Elasticsearch

Les archives sont indexées dans Elasticsearch pour permettre une recherche rapide par:
- Date historique
- Localisation
- Tags
- Contenu textuel

## API Endpoints

### Contenus
- `POST /api/v1/content/upload` : Upload un fichier
- `POST /api/v1/content/analyze` : Analyser un contenu
- `POST /api/v1/content/upload-and-analyze` : Upload et analyse en une opération
- `GET /api/v1/content/:content_id` : Récupérer un contenu
- `GET /api/v1/content/:content_id/analysis` : Récupérer l'analyse détaillée

### Archives
- `POST /api/v1/archives/` : Créer une archive
- `GET /api/v1/archives/` : Lister les archives
- `POST /api/v1/archives/:archive_id/entries` : Ajouter une entrée
- `GET /api/v1/archives/:archive_id/entries` : Lister les entrées
- `POST /api/v1/archives/search` : Rechercher dans les archives

### Rapports
- `GET /api/v1/reports/content/:content_id` : Générer un rapport complet

## Configuration

Les paramètres sont définis dans `.env` :
- Base de données PostgreSQL
- Elasticsearch
- Chemins des modèles ML
- Dossiers de stockage

## Technologies

- **Express.js** : Framework web Node.js
- **Sequelize** : ORM pour PostgreSQL
- **Sharp** : Traitement d'images haute performance
- **Elasticsearch** : Recherche et indexation
- **Multer** : Gestion des uploads de fichiers
- **Jest** : Framework de tests

## Améliorations futures

1. **Modèles ML réels** : Remplacer les heuristiques par des modèles préentraînés (TensorFlow.js)
2. **Cache Redis** : Mettre en cache les résultats d'analyse
3. **Traitement asynchrone** : Utiliser des queues (Bull) pour les analyses longues
4. **Authentification** : Ajouter JWT pour sécuriser l'API
5. **Webhooks** : Notifications lors de la fin d'analyse
6. **WebSockets** : Mises à jour en temps réel du statut d'analyse
