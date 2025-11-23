# Commandes Rapides de Test

## 1. Démarrer le serveur

```powershell
npm start
```

Ou en mode développement avec watch :
```powershell
npm run dev
```

## 2. Tester la santé du serveur

```powershell
curl http://localhost:3000/api/health
```

Ou avec PowerShell :
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/health" | Select-Object -ExpandProperty Content
```

## 3. Tester l'upload d'une image

**Avec curl (si installé) :**
```powershell
curl -X POST http://localhost:3000/api/upload-image -F "image=@C:\chemin\vers\image.jpg"
```

**Avec PowerShell :**
```powershell
$form = @{
    image = Get-Item "C:\chemin\vers\image.jpg"
}
Invoke-RestMethod -Uri "http://localhost:3000/api/upload-image" -Method Post -Form $form | ConvertTo-Json -Depth 10
```

## 4. Tester l'upload d'un PDF

**Avec curl :**
```powershell
curl -X POST http://localhost:3000/api/upload-pdf -F "pdf=@C:\chemin\vers\document.pdf"
```

**Avec PowerShell :**
```powershell
$form = @{
    pdf = Get-Item "C:\chemin\vers\document.pdf"
}
Invoke-RestMethod -Uri "http://localhost:3000/api/upload-pdf" -Method Post -Form $form | ConvertTo-Json -Depth 10
```

## 5. Tester l'upload d'une vidéo

**Avec curl :**
```powershell
curl -X POST http://localhost:3000/api/upload-video -F "video=@C:\chemin\vers\video.mp4"
```

**Avec PowerShell :**
```powershell
$form = @{
    video = Get-Item "C:\chemin\vers\video.mp4"
}
Invoke-RestMethod -Uri "http://localhost:3000/api/upload-video" -Method Post -Form $form | ConvertTo-Json -Depth 10
```

## 6. Exécuter le script de test automatique

```powershell
.\test_backend.ps1
```

## Exemple de Réponse Attendue

```json
{
  "success": true,
  "data": {
    "fileType": "image",
    "hash": "sha256_hash_here",
    "finalScore": 75,
    "forensic": {
      "manipulationScore": 25,
      "deepfakeScore": 20,
      "description": "..."
    },
    "osint": {
      "score": 80,
      "sources": [...],
      "occurrenceCount": 5
    },
    "nlp": {
      "score": 70,
      "contradictions": [],
      "description": "..."
    },
    "hedera": {
      "success": false,
      "message": "Hedera non configuré"
    },
    "report": {
      "summary": {...},
      "redFlags": [],
      "crediblePoints": [...]
    }
  }
}
```

