# PixelPioneers Backend - Analyse de Crédibilité de Fichiers

Backend professionnel en Node.js/Express pour analyser la crédibilité de fichiers (images, vidéos, PDF) en combinant analyse forensique, OSINT et traçabilité blockchain.

## 🚀 Fonctionnalités

- **Analyse Forensique** : Détection de manipulations, deepfakes et erreurs avec Hive AI
- **Analyse OSINT** : Reverse image search et recherche de texte avec SerpAPI
- **Analyse Sémantique** : Détection de contradictions, propagande et contenu généré avec OpenAI GPT
- **Traçabilité Blockchain** : Enregistrement des hash sur Hedera Hashgraph
- **Extraction de Métadonnées** : Analyse EXIF et détection d'incohérences
- **Score de Crédibilité** : Calcul pondéré (40% forensics, 40% OSINT, 20% NLP)

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- FFmpeg (pour le traitement vidéo)
- Clés API pour :
  - Hive AI
  - SerpAPI
  - OpenAI
  - Hedera Hashgraph

## 🔧 Installation

1. **Cloner le projet et installer les dépendances** :
```bash
npm install
```

2. **Installer FFmpeg** :
   - Windows : Télécharger depuis https://ffmpeg.org/download.html
   - macOS : `brew install ffmpeg`
   - Linux : `sudo apt-get install ffmpeg`

3. **Configurer les variables d'environnement** :
Créez un fichier `.env` à la racine du projet :
```env
PORT=3000
NODE_ENV=development

# Hive AI API Key
HIVE_API_KEY=your_hive_api_key_here

# SerpAPI Key
SERPAPI_KEY=your_serpapi_key_here

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Hedera Configuration
HEDERA_ACCOUNT_ID=your_hedera_account_id
HEDERA_PRIVATE_KEY=your_hedera_private_key
HEDERA_NETWORK=testnet

# File Upload Configuration
MAX_FILE_SIZE=100000000
UPLOAD_DIR=./uploads
```

## 🏃 Démarrage

```bash
# Mode développement (avec watch)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 API Endpoints

### POST /api/upload-image
Upload et analyse d'une image.

**Request** :
- Content-Type: `multipart/form-data`
- Field: `image` (fichier image)

**Response** :
```json
{
  "success": true,
  "data": {
    "fileType": "image",
    "hash": "sha256_hash",
    "finalScore": 85,
    "forensic": { ... },
    "osint": { ... },
    "nlp": { ... },
    "hedera": { ... },
    "report": { ... }
  }
}
```

### POST /api/upload-video
Upload et analyse d'une vidéo.

**Request** :
- Content-Type: `multipart/form-data`
- Field: `video` (fichier vidéo)

### POST /api/upload-pdf
Upload et analyse d'un PDF.

**Request** :
- Content-Type: `multipart/form-data`
- Field: `pdf` (fichier PDF)

### GET /api/health
Vérification de l'état du serveur et des services.

## 🏗️ Architecture

```
src/
├── config/
│   └── logger.js          # Configuration Winston
├── routes/
│   └── uploadRoutes.js    # Routes d'upload
├── services/
│   ├── analysisService.js # Service central d'orchestration
│   ├── forensicService.js # Analyse forensique (Hive AI)
│   ├── osintService.js    # Analyse OSINT (SerpAPI)
│   ├── nlpService.js      # Analyse NLP (OpenAI)
│   └── hederaService.js   # Traçabilité (Hedera)
├── utils/
│   ├── fileProcessor.js    # Traitement des fichiers
│   └── metadataExtractor.js # Extraction métadonnées
└── server.js              # Point d'entrée Express
```

## 📊 Format de Réponse

Chaque analyse retourne un objet JSON complet avec :

- **hash** : SHA-256 du fichier
- **finalScore** : Score de crédibilité (0-100)
- **forensic** : Résultats de l'analyse forensique
- **osint** : Résultats de la recherche OSINT
- **nlp** : Résultats de l'analyse sémantique
- **metadata** : Métadonnées extraites et incohérences
- **hedera** : Preuve d'enregistrement blockchain
- **report** : Rapport détaillé avec red flags, points crédibles, explication

## 🔍 Calcul du Score

Le score final est calculé avec la pondération suivante :
- **40%** : Analyse forensique (manipulation, deepfake, erreurs)
- **40%** : Analyse OSINT (sources trouvées, cohérence)
- **20%** : Analyse NLP (cohérence sémantique, contradictions)

Une réduction supplémentaire peut être appliquée en cas d'incohérences dans les métadonnées.

## 🛠️ Technologies Utilisées

- **Express** : Framework web
- **Multer** : Gestion d'upload de fichiers
- **Hive AI** : Détection de deepfakes et manipulations
- **SerpAPI** : Reverse image search et recherche web
- **OpenAI GPT-4** : Analyse sémantique
- **Hedera SDK** : Traçabilité blockchain
- **Sharp** : Traitement d'images
- **FFmpeg** : Traitement vidéo
- **pdf-parse** : Extraction de texte PDF
- **Tesseract.js** : OCR
- **exif-parser** : Extraction métadonnées EXIF

## 📝 Notes

- Les fichiers uploadés sont stockés dans le dossier `./uploads`
- Les logs sont stockés dans `./logs`
- Le backend est conçu pour être facilement intégré avec un frontend React/Next.js
- Tous les appels API incluent une gestion d'erreurs et des timeouts
- Les fichiers temporaires sont automatiquement nettoyés après analyse

## 🐛 Dépannage

**Erreur FFmpeg** : Vérifiez que FFmpeg est installé et dans le PATH
**Erreur API** : Vérifiez vos clés API dans le fichier `.env`
**Erreur Hedera** : Vérifiez que votre compte Hedera est configuré correctement

## 📄 Licence

MIT

