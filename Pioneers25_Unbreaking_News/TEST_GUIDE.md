# Guide de Test - Histified Backend (Port 8003)

## 🚀 Démarrage Rapide

### 1. Démarrer le serveur

```bash
npm start
# ou en mode développement
npm run dev
```

Le serveur démarre sur `http://localhost:8003`

### 2. Test automatique avec script

```bash
npm run test:api
```

Ce script teste automatiquement :
- ✅ Health check
- ✅ Root endpoint
- ✅ Upload d'image
- ✅ Analyse de contenu
- ✅ Génération de rapport
- ✅ Création d'archive

## 📋 Tests Manuels avec curl

### Health Check
```bash
curl http://localhost:8003/health
```

### Root Endpoint
```bash
curl http://localhost:8003/
```

### Upload d'image
```bash
curl -X POST "http://localhost:8003/api/v1/content/upload" \
  -F "file=@chemin/vers/votre/image.jpg"
```

**Réponse attendue :**
```json
{
  "content_id": 1,
  "filename": "image.jpg",
  "content_type": "image",
  "status": "uploaded"
}
```

### Analyser un contenu
```bash
curl -X POST "http://localhost:8003/api/v1/content/analyze" \
  -H "Content-Type: application/json" \
  -d '{"content_id": 1}'
```

**Réponse attendue :**
```json
{
  "content_id": 1,
  "analysis_id": 1,
  "summary": {
    "credibility_score": 0.75,
    "manipulation_probability": 0.25,
    "ai_detection_score": 0.3
  },
  "status": "completed"
}
```

### Récupérer un contenu
```bash
curl http://localhost:8003/api/v1/content/1
```

### Récupérer l'analyse détaillée
```bash
curl http://localhost:8003/api/v1/content/1/analysis
```

### Générer un rapport complet
```bash
curl http://localhost:8003/api/v1/reports/content/1
```

### Créer une archive
```bash
curl -X POST "http://localhost:8003/api/v1/archives/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Archive Test",
    "description": "Description de l'\''archive",
    "source": "Source de l'\''archive"
  }'
```

### Lister les archives
```bash
curl http://localhost:8003/api/v1/archives/
```

### Rechercher dans les archives
```bash
curl -X POST "http://localhost:8003/api/v1/archives/search" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "recherche",
    "location": "Paris",
    "tags": ["historique"]
  }'
```

## 🧪 Tests avec Postman

1. **Importer la collection** (à créer)
2. **Configurer l'environnement** :
   - Variable `base_url` : `http://localhost:8003`
3. **Exécuter les requêtes** dans l'ordre :
   - Health Check
   - Upload Image
   - Analyze Content
   - Get Report

## 📊 Exemple de Workflow Complet

```bash
# 1. Vérifier que le serveur fonctionne
curl http://localhost:8003/health

# 2. Uploader une image
curl -X POST "http://localhost:8003/api/v1/content/upload" \
  -F "file=@test_image.jpg" > upload_response.json

# 3. Extraire le content_id (Windows PowerShell)
$response = Get-Content upload_response.json | ConvertFrom-Json
$contentId = $response.content_id

# 4. Analyser le contenu
curl -X POST "http://localhost:8003/api/v1/content/analyze" \
  -H "Content-Type: application/json" \
  -d "{\"content_id\": $contentId}"

# 5. Générer le rapport
curl "http://localhost:8003/api/v1/reports/content/$contentId"
```

## 🔍 Vérification des Endpoints

### Endpoints Disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | Informations API |
| POST | `/api/v1/content/upload` | Upload fichier |
| POST | `/api/v1/content/analyze` | Analyser contenu |
| POST | `/api/v1/content/upload-and-analyze` | Upload + Analyse |
| GET | `/api/v1/content/:id` | Récupérer contenu |
| GET | `/api/v1/content/:id/analysis` | Récupérer analyse |
| GET | `/api/v1/reports/content/:id` | Générer rapport |
| POST | `/api/v1/archives/` | Créer archive |
| GET | `/api/v1/archives/` | Lister archives |
| POST | `/api/v1/archives/:id/entries` | Ajouter entrée |
| GET | `/api/v1/archives/:id/entries` | Lister entrées |
| POST | `/api/v1/archives/search` | Rechercher archives |

## ⚠️ Dépannage

### Le serveur ne répond pas
```bash
# Vérifier que le serveur est démarré
# Vérifier le port dans .env ou server.js
```

### Erreur de connexion à la base de données
```bash
# Vérifier la configuration dans .env
# SQLite sera utilisé automatiquement si PostgreSQL n'est pas configuré
```

### Erreur lors de l'upload
```bash
# Vérifier que le dossier uploads/ existe
# Vérifier les permissions d'écriture
```

## 📝 Notes

- Le port par défaut est **8003** (configuré dans votre `.env` ou `server.js`)
- Les fichiers uploadés sont stockés dans `./uploads/`
- Les archives sont stockées dans `./archives/`
- SQLite est utilisé par défaut si PostgreSQL n'est pas configuré

