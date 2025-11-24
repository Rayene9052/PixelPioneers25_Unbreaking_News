# 🚀 Guide de Test Rapide - Port 8002

## ✅ Étape 1 : Initialiser la Base de Données

**⚠️ IMPORTANT : À faire UNE SEULE FOIS avant de démarrer le serveur**

```bash
npm run init-db
```

Vous devriez voir :
```
✅ Base de données initialisée avec succès!
📊 Tables créées:
   - contents
   - content_analyses
   - content_metadata
   - archives
   - archive_entries
```

---

## ✅ Étape 2 : Démarrer le Serveur

```bash
npm start
```

Vous devriez voir :
```
Histified Backend running on port 8002
API Documentation: http://localhost:8002/api/v1
✅ SQLite database configured for development.
📁 Dossier créé: ./uploads
```

---

## 🧪 Étape 3 : Tests dans Postman (Port 8002)

### Test 1 : Health Check ✅

**Méthode :** `GET`  
**URL :** `http://localhost:8002/health`

**Résultat attendu :**
```json
{
  "status": "healthy"
}
```

✅ Si ça fonctionne, le serveur est opérationnel !

---

### Test 2 : Upload d'Image 📤

**Méthode :** `POST`  
**URL :** `http://localhost:8002/api/v1/content/upload`

**Configuration :**
1. Onglet **Body**
2. Cochez **form-data**
3. **Key :** `file` (type **File**)
4. **Value :** Sélectionnez une image (.jpg, .png, etc.)

**Résultat attendu :**
```json
{
  "content_id": 1,
  "filename": "votre_image.jpg",
  "content_type": "image",
  "status": "uploaded"
}
```

💾 **Notez le `content_id`** pour les prochains tests !

---

### Test 3 : Analyser l'Image 🔍

**Méthode :** `POST`  
**URL :** `http://localhost:8002/api/v1/content/analyze`

**Body (raw JSON) :**
```json
{
  "content_id": 1
}
```
*(Remplacez `1` par votre `content_id`)*

**Résultat attendu :**
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

⏱️ *L'analyse peut prendre quelques secondes*

---

### Test 4 : Obtenir le Rapport Complet 📊

**Méthode :** `GET`  
**URL :** `http://localhost:8002/api/v1/reports/content/1`

*(Remplacez `1` par votre `content_id`)*

**Résultat attendu :**
Un rapport JSON complet avec :
- Score de crédibilité
- Détection IA
- Analyse forensique
- Recommandations

---

### Test 5 : Récupérer le Contenu 📄

**Méthode :** `GET`  
**URL :** `http://localhost:8002/api/v1/content/1`

*(Remplacez `1` par votre `content_id`)*

---

## 🎯 Séquence Complète Recommandée

1. ✅ **Health Check** → Vérifier que le serveur fonctionne
2. 📤 **Upload Image** → Uploader votre image
3. 🔍 **Analyze** → Analyser l'image (utilisez le `content_id` de l'étape 2)
4. 📊 **Get Report** → Obtenir le rapport complet
5. 📄 **Get Content** → Voir les détails du contenu

---

## 🔧 Si ça ne fonctionne pas

### Erreur : "Something went wrong!"

1. **Vérifiez les logs du serveur** dans votre terminal
2. **Assurez-vous d'avoir exécuté** `npm run init-db`
3. **Vérifiez que le serveur est démarré** sur le port 8002

### Erreur : "Aucun fichier fourni"

- Vérifiez que le champ s'appelle exactement `file` (pas `image`)
- Vérifiez que le type est **"File"** (pas "Text")
- Vérifiez que vous avez sélectionné un fichier

### Erreur : "Table doesn't exist"

```bash
npm run init-db
```

---

## 📝 Checklist Avant de Tester

- [ ] Base de données initialisée (`npm run init-db`)
- [ ] Serveur démarré (`npm start`)
- [ ] Port correct (8002)
- [ ] Postman configuré avec l'URL `http://localhost:8002`
- [ ] Image prête à uploader

---

## 🎉 C'est parti !

Commencez par le **Health Check**, puis l'**Upload**, puis l'**Analyse** !

