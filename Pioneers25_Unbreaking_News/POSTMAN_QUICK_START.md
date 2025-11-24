# 🚀 Guide Rapide Postman - Upload d'Images

## ⚡ Configuration Rapide (2 minutes)

### Étape 1 : Créer l'Environnement

1. Dans Postman, cliquez sur **Environments** (icône d'engrenage en haut à droite)
2. Cliquez sur **+** pour créer un nouvel environnement
3. Nom : `Histified Local`
4. Ajoutez cette variable :
   - **Variable :** `base_url`
   - **Initial Value :** `http://localhost:8003`
5. Cliquez sur **Save**
6. Sélectionnez cet environnement dans le menu déroulant en haut à droite

---

## 📤 Endpoint 1 : Upload d'Image

### Configuration dans Postman

**Méthode :** `POST`  
**URL :** `{{base_url}}/api/v1/content/upload`

### Étapes détaillées :

1. **Onglet "Body"**
   - ✅ Cochez **form-data** (PAS "x-www-form-urlencoded", PAS "raw")

2. **Ajouter le champ "file"**
   - Dans la première ligne du tableau :
     - **Key :** Tapez `file` (exactement, en minuscules)
     - **Type :** Cliquez sur le menu déroulant à droite de "Key" et sélectionnez **"File"** (pas "Text")
     - **Value :** Cliquez sur **"Select Files"** et choisissez votre image

3. **Vérifications importantes :**
   - ✅ Le champ s'appelle `file` (pas `image`, pas `upload`, pas `file[]`)
   - ✅ Le type est **"File"** (vous verrez "Select Files" au lieu d'un champ texte)
   - ✅ Vous avez bien sélectionné un fichier image (.jpg, .png, etc.)

4. **Headers :**
   - ❌ **NE PAS** ajouter `Content-Type` manuellement
   - Postman l'ajoute automatiquement : `Content-Type: multipart/form-data; boundary=...`

5. **Cliquez sur "Send"**

### ✅ Réponse attendue (200 OK) :

```json
{
  "content_id": 1,
  "filename": "votre_image.jpg",
  "content_type": "image",
  "status": "uploaded"
}
```

### ❌ Erreurs courantes :

**Erreur : "Aucun fichier fourni"**
- ✅ Vérifiez que le champ s'appelle exactement `file`
- ✅ Vérifiez que le type est "File" (pas "Text")
- ✅ Vérifiez que vous avez sélectionné un fichier

**Erreur : "Type de fichier non supporté"**
- ✅ Utilisez uniquement : .jpg, .jpeg, .png, .gif, .bmp, .tiff, .tif, .webp
- ✅ Vérifiez l'extension du fichier

**Erreur : "MulterError: Unexpected field"**
- ✅ Le champ doit s'appeler exactement `file` (pas `files`, pas `image`)
- ✅ Vérifiez qu'il n'y a pas d'espaces avant/après

---

## 🔍 Endpoint 2 : Analyser l'Image Uploadée

**Méthode :** `POST`  
**URL :** `{{base_url}}/api/v1/content/analyze`

### Configuration :

1. **Onglet "Body"**
   - ✅ Cochez **raw**
   - ✅ Sélectionnez **JSON** dans le menu déroulant

2. **Corps de la requête :**
```json
{
  "content_id": 1
}
```
*(Remplacez `1` par le `content_id` retourné par l'upload)*

3. **Headers :**
   - Postman ajoute automatiquement : `Content-Type: application/json`

4. **Cliquez sur "Send"**

### ✅ Réponse attendue :

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

---

## 📊 Endpoint 3 : Obtenir le Rapport Complet

**Méthode :** `GET`  
**URL :** `{{base_url}}/api/v1/reports/content/1`

*(Remplacez `1` par votre `content_id`)*

### Configuration :

- **Body :** Aucun
- **Headers :** Aucun
- Cliquez sur **"Send"**

### ✅ Réponse attendue :

Un rapport JSON complet avec :
- Score de crédibilité
- Détection IA
- Analyse forensique
- Recommandations

---

## 🎯 Workflow Complet Recommandé

### 1. Test Health Check (vérifier que le serveur fonctionne)

**GET** `{{base_url}}/health`

### 2. Upload Image

**POST** `{{base_url}}/api/v1/content/upload`
- Body : form-data
- Key : `file` (type File)
- Value : Sélectionnez votre image

**💾 Notez le `content_id` retourné**

### 3. Analyser

**POST** `{{base_url}}/api/v1/content/analyze`
- Body : raw JSON
```json
{
  "content_id": VOTRE_CONTENT_ID
}
```

### 4. Rapport

**GET** `{{base_url}}/api/v1/reports/content/VOTRE_CONTENT_ID`

---

## 🖼️ Visualisation Postman (Upload)

```
┌─────────────────────────────────────────────────────┐
│ POST  http://localhost:8003/api/v1/content/upload   │
├─────────────────────────────────────────────────────┤
│ Params  Authorization  Headers  Body  Pre-request  │
│                                                      │
│ ○ none  ○ form-data  ○ x-www-form-urlencoded       │
│ ○ raw   ○ binary     ○ GraphQL                      │
│                                                      │
│ [✓] form-data                                        │
│                                                      │
│ Key          │ Type │ Value                          │
│ ─────────────┼──────┼───────────────────────────────│
│ file [File]  │ File │ [Select Files] 📷 image.jpg   │
│              │      │                               │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Script Postman pour Sauvegarder Automatiquement le content_id

Dans l'onglet **"Tests"** de votre requête Upload, ajoutez :

```javascript
// Sauvegarder automatiquement le content_id
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("content_id", jsonData.content_id);
    console.log("✅ Content ID sauvegardé:", jsonData.content_id);
}
```

Ensuite, dans la requête Analyze, utilisez :
```json
{
  "content_id": {{content_id}}
}
```

---

## 📝 Checklist Avant d'Envoyer

- [ ] Le serveur est démarré (`npm start`)
- [ ] Le port est correct (8003)
- [ ] L'environnement Postman est sélectionné
- [ ] Le champ s'appelle exactement `file`
- [ ] Le type est "File" (pas "Text")
- [ ] Un fichier image est sélectionné
- [ ] Le format est supporté (.jpg, .png, etc.)

---

## 🆘 Dépannage

### Le serveur ne répond pas
```bash
# Vérifiez que le serveur est démarré
npm start

# Vérifiez les logs dans le terminal
```

### Erreur 500 Internal Server Error
- Vérifiez les logs du serveur dans le terminal
- Vérifiez que le dossier `uploads/` existe
- Vérifiez les permissions d'écriture

### Erreur de connexion à la base de données
- SQLite sera utilisé automatiquement si PostgreSQL n'est pas configuré
- Vérifiez que le fichier `histified.db` peut être créé

---

## 📞 Besoin d'aide ?

1. Vérifiez les logs du serveur dans votre terminal
2. Testez d'abord `/health` pour vérifier que le serveur fonctionne
3. Vérifiez que vous suivez exactement les étapes ci-dessus

