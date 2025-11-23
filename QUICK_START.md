# Guide de Démarrage Rapide

## Installation en 3 étapes

### 1. Installer les dépendances
```bash
npm install
```

### 2. Installer FFmpeg
- **Windows** : Télécharger depuis https://ffmpeg.org/download.html et ajouter au PATH
- **macOS** : `brew install ffmpeg`
- **Linux** : `sudo apt-get install ffmpeg`

### 3. Configurer les variables d'environnement
Créez un fichier `.env` (voir `ENV_SETUP.md` pour les détails)

## Démarrer le serveur

```bash
npm start
# ou en mode développement avec watch
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

## Tester l'API

### Vérifier la santé du serveur
```bash
curl http://localhost:3000/api/health
```

### Uploader une image (exemple avec curl)
```bash
curl -X POST http://localhost:3000/api/upload-image \
  -F "image=@/chemin/vers/votre/image.jpg"
```

### Uploader une vidéo
```bash
curl -X POST http://localhost:3000/api/upload-video \
  -F "video=@/chemin/vers/votre/video.mp4"
```

### Uploader un PDF
```bash
curl -X POST http://localhost:3000/api/upload-pdf \
  -F "pdf=@/chemin/vers/votre/document.pdf"
```

## Structure de la Réponse

Chaque analyse retourne un JSON avec :
- `finalScore` : Score de crédibilité (0-100)
- `forensic` : Résultats de l'analyse forensique
- `osint` : Résultats de la recherche OSINT
- `nlp` : Résultats de l'analyse sémantique
- `hedera` : Preuve d'enregistrement blockchain
- `report` : Rapport détaillé complet

## Intégration Frontend

Voir `INTEGRATION_FRONTEND.md` pour des exemples d'intégration React/Next.js.

## Dépannage

**Erreur FFmpeg** : Vérifiez que FFmpeg est installé et dans le PATH
**Erreur API** : Vérifiez vos clés dans le fichier `.env`
**Port déjà utilisé** : Changez `PORT` dans `.env`

## Documentation Complète

- `README_BACKEND.md` : Documentation complète
- `ENV_SETUP.md` : Configuration des variables d'environnement
- `INTEGRATION_FRONTEND.md` : Guide d'intégration frontend

