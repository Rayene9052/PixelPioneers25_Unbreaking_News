# 🐛 Guide de Débogage - Erreur "Contenu non trouvé"

## ❌ Erreur : "Contenu non trouvé"

Cette erreur signifie que vous essayez d'accéder à un contenu qui n'existe pas dans la base de données.

---

## 🔍 Causes Possibles

### 1. Vous n'avez pas encore uploadé de fichier

**Solution :** Commencez par uploader un fichier avant d'essayer de le récupérer.

### 2. Vous utilisez un mauvais `content_id`

**Solution :** Utilisez le `content_id` retourné par l'endpoint `/upload`.

### 3. La base de données a été réinitialisée

**Solution :** Si vous avez supprimé `histified.db`, tous les contenus ont été perdus. Ré-uploader un fichier.

---

## ✅ Ordre Correct des Opérations

### Étape 1 : Upload (OBLIGATOIRE EN PREMIER)

**POST** `http://localhost:8002/api/v1/content/upload`

**Réponse :**
```json
{
  "content_id": 1,  ← NOTEZ CET ID !
  "filename": "image.jpg",
  "content_type": "image",
  "status": "uploaded"
}
```

💾 **IMPORTANT :** Copiez le `content_id` retourné !

---

### Étape 2 : Utiliser le content_id

Maintenant vous pouvez utiliser cet ID pour :

**Analyser :**
```
POST http://localhost:8002/api/v1/content/analyze
Body: { "content_id": 1 }
```

**Récupérer :**
```
GET http://localhost:8002/api/v1/content/1
```

**Rapport :**
```
GET http://localhost:8002/api/v1/reports/content/1
```

---

## 🔧 Comment Vérifier les Contenus Existants

### Option 1 : Lister tous les contenus (à ajouter)

Actuellement, il n'y a pas d'endpoint pour lister tous les contenus. Vous devez connaître le `content_id`.

### Option 2 : Vérifier dans la base de données

Si vous utilisez SQLite, vous pouvez vérifier :

```bash
# Installer sqlite3 (si pas déjà installé)
npm install -g sqlite3

# Ouvrir la base de données
sqlite3 histified.db

# Lister tous les contenus
SELECT id, filename, contentType FROM contents;

# Quitter
.quit
```

---

## 🎯 Workflow Complet Recommandé

### 1. Health Check
```
GET http://localhost:8002/health
```
✅ Vérifie que le serveur fonctionne

### 2. Upload Image
```
POST http://localhost:8002/api/v1/content/upload
Body: form-data, file: [votre image]
```
✅ Retourne `content_id: 1` (par exemple)

### 3. Analyser
```
POST http://localhost:8002/api/v1/content/analyze
Body: { "content_id": 1 }
```
✅ Utilise le `content_id` de l'étape 2

### 4. Récupérer le Contenu
```
GET http://localhost:8002/api/v1/content/1
```
✅ Utilise le même `content_id`

### 5. Rapport
```
GET http://localhost:8002/api/v1/reports/content/1
```
✅ Utilise le même `content_id`

---

## 💡 Astuce Postman : Sauvegarder Automatiquement le content_id

Dans l'onglet **Tests** de votre requête Upload, ajoutez :

```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("content_id", jsonData.content_id);
    console.log("✅ Content ID sauvegardé:", jsonData.content_id);
}
```

Ensuite, dans vos autres requêtes, utilisez :
```json
{
  "content_id": {{content_id}}
}
```

Et pour les URLs :
```
GET http://localhost:8002/api/v1/content/{{content_id}}
```

---

## 🆘 Solutions Rapides

### Si vous avez oublié le content_id

1. **Ré-uploader le fichier** pour obtenir un nouveau `content_id`
2. **Vérifier dans la base de données** (voir ci-dessus)

### Si vous obtenez toujours l'erreur après upload

1. **Vérifiez les logs du serveur** - Y a-t-il des erreurs ?
2. **Vérifiez que la base de données est initialisée** : `npm run init-db`
3. **Vérifiez que le serveur est bien démarré**

---

## 📝 Checklist

Avant d'essayer de récupérer un contenu :

- [ ] J'ai uploadé un fichier avec succès
- [ ] J'ai noté le `content_id` retourné
- [ ] J'utilise exactement ce `content_id` (pas un autre nombre)
- [ ] Le serveur est toujours démarré
- [ ] La base de données n'a pas été supprimée

---

## 🎯 Test Rapide

1. **Upload** une image → Notez le `content_id`
2. **Health Check** → Vérifiez que ça fonctionne
3. **Get Content** avec le `content_id` noté → Devrait fonctionner !

