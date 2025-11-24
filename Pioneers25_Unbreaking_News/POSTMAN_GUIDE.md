# Guide Postman - Histified Backend API

## 📋 Configuration Initiale

### 1. Créer un Environnement Postman

1. Ouvrez Postman
2. Cliquez sur **Environments** (environnements) dans la barre latérale
3. Cliquez sur **+** pour créer un nouvel environnement
4. Nommez-le "Histified Local"
5. Ajoutez ces variables :

| Variable | Valeur Initiale | Type |
|----------|----------------|------|
| `base_url` | `http://localhost:8003` | default |
| `content_id` | (vide) | default |
| `analysis_id` | (vide) | default |
| `archive_id` | (vide) | default |

6. Cliquez sur **Save**

### 2. Sélectionner l'Environnement

Dans le menu déroulant en haut à droite de Postman, sélectionnez **"Histified Local"**

---

## 🖼️ Endpoints pour Images

### 1. Health Check

**Méthode :** `GET`  
**URL :** `{{base_url}}/health`

**Headers :** Aucun

**Body :** Aucun

**Réponse attendue :**
```json
{
  "status": "healthy"
}
```

---

### 2. Upload d'Image ⭐

**Méthode :** `POST`  
**URL :** `{{base_url}}/api/v1/content/upload`

**Headers :** 
- **Ne pas ajouter** `Content-Type` manuellement (Postman le fait automatiquement pour multipart/form-data)

**Body :**
1. Sélectionnez l'onglet **Body**
2. Cochez **form-data**
3. Dans la première ligne :
   - **Key :** `file` (important : changez le type de "Text" à **"File"** en cliquant sur le menu déroulant)
   - **Value :** Cliquez sur **"Select Files"** et choisissez votre image

**⚠️ IMPORTANT :**
- Le champ doit s'appeler exactement `file` (pas `image`, pas `upload`)
- Le type doit être **"File"** (pas "Text")
- Accepte : `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`, `.tif`, `.webp`

**Réponse attendue :**
```json
{
  "content_id": 1,
  "filename": "votre_image.jpg",
  "content_type": "image",
  "status": "uploaded"
}
```

**💡 Astuce :** Après la réponse, copiez le `content_id` et sauvegardez-le dans la variable d'environnement `{{content_id}}` pour les prochains tests.

---

### 3. Analyser un Contenu ⭐

**Méthode :** `POST`  
**URL :** `{{base_url}}/api/v1/content/analyze`

**Headers :**
```
Content-Type: application/json
```

**Body :**
1. Sélectionnez l'onglet **Body**
2. Cochez **raw**
3. Sélectionnez **JSON** dans le menu déroulant
4. Entrez :
```json
{
  "content_id": {{content_id}}
}
```

**Réponse attendue :**
```json
{
  "content_id": 1,
  "analysis_id": 1,
  "summary": {
    "credibility_score": 0.75,
    "manipulation_probability": 0.25,
    "ai_detection_score": 0.3,
    "historical_match_score": 0.0
  },
  "status": "completed"
}
```

**⏱️ Note :** L'analyse peut prendre quelques secondes selon la taille de l'image.

---

### 4. Upload et Analyser en Une Opération ⭐

**Méthode :** `POST`  
**URL :** `{{base_url}}/api/v1/content/upload-and-analyze`

**Headers :** Aucun (Postman gère automatiquement)

**Body :**
1. Sélectionnez l'onglet **Body**
2. Cochez **form-data**
3. Dans la première ligne :
   - **Key :** `file` (type **"File"**)
   - **Value :** Sélectionnez votre image
4. (Optionnel) Dans la deuxième ligne :
   - **Key :** `metadata` (type **"Text"**)
   - **Value :** `{"date": "2024-01-01", "location": "Paris"}`

**Réponse attendue :**
```json
{
  "content_id": 1,
  "analysis_id": 1,
  "summary": {
    "credibility_score": 0.75,
    "manipulation_probability": 0.25
  },
  "status": "completed"
}
```

---

### 5. Récupérer un Contenu

**Méthode :** `GET`  
**URL :** `{{base_url}}/api/v1/content/{{content_id}}`

**Headers :** Aucun

**Body :** Aucun

**Réponse attendue :**
```json
{
  "id": 1,
  "filename": "votre_image.jpg",
  "content_type": "image",
  "upload_date": "2024-01-01T12:00:00.000Z",
  "analysis": {
    "id": 1,
    "credibility_score": 0.75,
    "manipulation_probability": 0.25,
    "analysis_date": "2024-01-01T12:00:05.000Z"
  }
}
```

---

### 6. Récupérer l'Analyse Détaillée

**Méthode :** `GET`  
**URL :** `{{base_url}}/api/v1/content/{{content_id}}/analysis`

**Headers :** Aucun

**Body :** Aucun

**Réponse attendue :**
```json
{
  "analysis_id": 1,
  "content_id": 1,
  "ai_detection_score": 0.3,
  "ai_detection_confidence": 0.36,
  "ela_score": 0.2,
  "residual_analysis_score": 0.15,
  "metadata_consistency_score": 0.9,
  "historical_match_score": 0.0,
  "credibility_score": 0.75,
  "manipulation_probability": 0.25,
  "analysis_details": { ... }
}
```

---

### 7. Générer un Rapport Complet ⭐

**Méthode :** `GET`  
**URL :** `{{base_url}}/api/v1/reports/content/{{content_id}}`

**Headers :** Aucun

**Body :** Aucun

**Réponse attendue :**
```json
{
  "report_id": "RPT-1-1",
  "generated_at": "2024-01-01T12:00:10.000Z",
  "content": { ... },
  "analysis_summary": { ... },
  "detailed_results": {
    "ai_detection": { ... },
    "forensic_analysis": { ... },
    "metadata_consistency": { ... },
    "historical_verification": { ... },
    "alteration_detection": { ... }
  },
  "credibility_assessment": {
    "overall_score": 0.75,
    "risk_level": "FAIBLE",
    "recommendations": [ ... ]
  }
}
```

---

## 🔧 Dépannage Upload

### Erreur : "Aucun fichier fourni"

**Problème :** Le champ `file` n'est pas correctement configuré

**Solution :**
1. Vérifiez que le champ s'appelle exactement `file` (pas `image`, pas `upload`)
2. Vérifiez que le type est **"File"** (pas "Text")
3. Vérifiez que vous avez bien sélectionné un fichier

### Erreur : "Type de fichier non supporté"

**Problème :** Le format de fichier n'est pas supporté

**Solution :**
- Utilisez uniquement : `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`, `.tif`, `.webp`
- Vérifiez l'extension du fichier

### Erreur : "Cannot read properties of undefined"

**Problème :** Le serveur n'est pas démarré ou le port est incorrect

**Solution :**
1. Vérifiez que le serveur est démarré : `npm start`
2. Vérifiez que le port dans Postman correspond (8003)
3. Testez d'abord le endpoint `/health`

### Erreur : "MulterError: Unexpected field"

**Problème :** Le nom du champ dans Postman ne correspond pas

**Solution :**
- Le champ doit s'appeler exactement `file` (en minuscules)
- Vérifiez qu'il n'y a pas d'espaces avant/après

---

## 📸 Capture d'écran Postman (Upload)

Voici comment configurer l'upload dans Postman :

```
┌─────────────────────────────────────────┐
│ POST  {{base_url}}/api/v1/content/upload│
├─────────────────────────────────────────┤
│ Body  [✓] form-data                     │
│                                         │
│ Key          │ Type │ Value             │
│ ─────────────┼──────┼──────────────────│
│ file [File]  │ File │ [Select Files]   │
│              │      │ 📷 votre_image.jpg│
└─────────────────────────────────────────┘
```

---

## 🎯 Workflow Recommandé

1. **Health Check** → Vérifier que le serveur fonctionne
2. **Upload Image** → Uploader votre image
3. **Analyze Content** → Analyser l'image uploadée
4. **Get Report** → Obtenir le rapport complet

---

## 💡 Astuces Postman

### Sauvegarder les Variables Automatiquement

Dans Postman, vous pouvez créer un **Test Script** pour sauvegarder automatiquement le `content_id` :

```javascript
// Dans l'onglet "Tests" de la requête Upload
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("content_id", jsonData.content_id);
    console.log("Content ID sauvegardé:", jsonData.content_id);
}
```

### Collection Postman

Créez une collection "Histified API" et ajoutez toutes ces requêtes pour les réutiliser facilement.

---

## 📞 Support

Si vous rencontrez toujours des problèmes :
1. Vérifiez les logs du serveur dans le terminal
2. Vérifiez que le dossier `uploads/` existe et est accessible en écriture
3. Vérifiez la taille du fichier (limite : 50MB par défaut)

