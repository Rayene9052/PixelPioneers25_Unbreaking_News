# Commandes de Test du Backend

Ce document contient toutes les commandes nécessaires pour tester le backend sans Hedera.

## Prérequis

1. Installer les dépendances :
```bash
npm install
```

2. Configurer le fichier `.env` avec vos clés API (sans Hedera) :
```env
PORT=3000
NODE_ENV=development

HIVE_ACCESS_KEY=votre_cle_access
HIVE_SECRET_KEY=votre_cle_secret
SERPAPI_KEY=votre_cle_serpapi
OPENAI_API_KEY=votre_cle_openai

# Hedera laissé vide (optionnel)
HEDERA_ACCOUNT_ID=
HEDERA_PRIVATE_KEY=
HEDERA_NETWORK=testnet

MAX_FILE_SIZE=100000000
UPLOAD_DIR=./uploads
```

3. Démarrer le serveur :
```bash
npm start
# ou en mode développement
npm run dev
```

## Tests Manuels avec cURL

### 1. Test de santé du serveur
```bash
curl http://localhost:3000/api/health
```

### 2. Test de la route racine
```bash
curl http://localhost:3000/
```

### 3. Test upload d'image
```bash
curl -X POST http://localhost:3000/api/upload-image \
  -F "image=@chemin/vers/votre/image.jpg"
```

### 4. Test upload de PDF
```bash
curl -X POST http://localhost:3000/api/upload-pdf \
  -F "pdf=@chemin/vers/votre/document.pdf"
```

### 5. Test upload de vidéo
```bash
curl -X POST http://localhost:3000/api/upload-video \
  -F "video=@chemin/vers/votre/video.mp4"
```

## Tests avec PowerShell (Windows)

### 1. Test de santé
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET
```

### 2. Test upload d'image
```powershell
$formData = @{
    image = Get-Item "chemin\vers\votre\image.jpg"
}
Invoke-WebRequest -Uri "http://localhost:3000/api/upload-image" -Method POST -Form $formData
```

### 3. Test upload de PDF
```powershell
$formData = @{
    pdf = Get-Item "chemin\vers\votre\document.pdf"
}
Invoke-WebRequest -Uri "http://localhost:3000/api/upload-pdf" -Method POST -Form $formData
```

### 4. Test upload de vidéo
```powershell
$formData = @{
    video = Get-Item "chemin\vers\votre\video.mp4"
}
Invoke-WebRequest -Uri "http://localhost:3000/api/upload-video" -Method POST -Form $formData
```

## Utiliser les Scripts de Test

### Sur Linux/Mac :
```bash
chmod +x test_backend.sh
./test_backend.sh
```

### Sur Windows (PowerShell) :
```powershell
.\test_backend.ps1
```

## Tests avec Postman ou Insomnia

### Collection Postman

1. **GET** `http://localhost:3000/api/health`
   - Vérifie l'état du serveur

2. **POST** `http://localhost:3000/api/upload-image`
   - Body: form-data
   - Key: `image` (type: File)
   - Value: Sélectionner un fichier image

3. **POST** `http://localhost:3000/api/upload-pdf`
   - Body: form-data
   - Key: `pdf` (type: File)
   - Value: Sélectionner un fichier PDF

4. **POST** `http://localhost:3000/api/upload-video`
   - Body: form-data
   - Key: `video` (type: File)
   - Value: Sélectionner un fichier vidéo

## Vérification des Réponses

Chaque endpoint d'upload retourne un JSON avec :
- `success`: true/false
- `data`: Objet contenant :
  - `finalScore`: Score de crédibilité (0-100)
  - `forensic`: Résultats de l'analyse forensique
  - `osint`: Résultats OSINT
  - `nlp`: Résultats de l'analyse sémantique
  - `hedera`: `{ success: false, message: "Hedera non configuré" }`
  - `report`: Rapport détaillé complet

## Notes Importantes

- **Hedera est maintenant optionnel** : Le backend fonctionne sans configuration Hedera
- Les analyses fonctionnent normalement, seule la traçabilité blockchain est désactivée
- Tous les autres services (Hive AI, SerpAPI, OpenAI) doivent être configurés pour que les tests fonctionnent

