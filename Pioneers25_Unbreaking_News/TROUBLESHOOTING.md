# 🔧 Guide de Dépannage - Histified Backend

## ❌ Erreur : "Something went wrong!"

Cette erreur générique indique une erreur 500. Voici comment la résoudre :

### Étape 1 : Vérifier les logs du serveur

Regardez dans votre terminal où le serveur tourne. Vous devriez voir l'erreur détaillée.

### Étape 2 : Initialiser la base de données

**Le problème le plus courant :** Les tables de la base de données n'existent pas.

**Solution :**

```bash
npm run init-db
```

Ce script va créer toutes les tables nécessaires.

### Étape 3 : Vérifier que les dossiers existent

Les dossiers `uploads/` et `archives/` doivent exister. Ils sont créés automatiquement au démarrage, mais si ce n'est pas le cas :

```bash
mkdir uploads
mkdir archives
```

### Étape 4 : Vérifier la configuration

Assurez-vous que le fichier `.env` existe (ou que les variables d'environnement sont définies).

---

## 🔍 Erreurs Courantes et Solutions

### Erreur : "Table 'contents' doesn't exist"

**Cause :** Les tables de la base de données n'ont pas été créées.

**Solution :**
```bash
npm run init-db
```

---

### Erreur : "ENOENT: no such file or directory, open './uploads/...'"

**Cause :** Le dossier `uploads/` n'existe pas.

**Solution :**
```bash
mkdir uploads
```

Ou redémarrez le serveur (il devrait créer le dossier automatiquement).

---

### Erreur : "SQLITE_ERROR: no such table: contents"

**Cause :** Les tables SQLite n'existent pas.

**Solution :**
```bash
npm run init-db
```

---

### Erreur : "Cannot read properties of undefined (reading 'create')"

**Cause :** Le modèle Sequelize n'est pas correctement importé ou la base de données n'est pas synchronisée.

**Solution :**
1. Vérifiez que `npm run init-db` a été exécuté
2. Vérifiez les imports dans `routes/content.js`

---

### Erreur : "MulterError: Unexpected field"

**Cause :** Le nom du champ dans Postman ne correspond pas.

**Solution :**
- Dans Postman, le champ doit s'appeler exactement `file` (pas `image`, pas `upload`)
- Le type doit être "File" (pas "Text")

---

## ✅ Checklist de Vérification

Avant de tester l'upload, vérifiez :

- [ ] Le serveur est démarré (`npm start`)
- [ ] La base de données est initialisée (`npm run init-db`)
- [ ] Le dossier `uploads/` existe
- [ ] Le fichier `.env` existe (ou les variables sont définies)
- [ ] Le port est correct (8003)
- [ ] Les logs du serveur ne montrent pas d'erreurs au démarrage

---

## 🐛 Mode Debug

Pour avoir plus de détails sur les erreurs, assurez-vous que dans votre `.env` :

```env
NODE_ENV=development
```

Cela affichera les messages d'erreur détaillés dans les réponses API.

---

## 📝 Logs à Vérifier

Quand vous obtenez une erreur, vérifiez dans le terminal du serveur :

1. **Au démarrage :**
   - ✅ "Histified Backend running on port 8003"
   - ✅ "SQLite database configured for development" ou "Database connection established"
   - ✅ "Dossier créé: ./uploads"

2. **Lors de l'upload :**
   - ❌ Toute erreur en rouge
   - ❌ Stack trace complète

---

## 🔄 Réinitialisation Complète

Si rien ne fonctionne, réinitialisez tout :

```bash
# 1. Arrêter le serveur (Ctrl+C)

# 2. Supprimer la base de données (si SQLite)
rm histified.db

# 3. Supprimer les dossiers (optionnel)
rm -rf uploads archives

# 4. Réinitialiser la base de données
npm run init-db

# 5. Redémarrer le serveur
npm start
```

---

## 💡 Conseils

1. **Toujours vérifier les logs du serveur** - C'est là que vous verrez l'erreur réelle
2. **Tester d'abord `/health`** - Pour vérifier que le serveur fonctionne
3. **Utiliser `npm run init-db`** - Si vous obtenez des erreurs de tables
4. **Vérifier les permissions** - Assurez-vous que l'application peut écrire dans `uploads/`

---

## 📞 Besoin d'aide ?

Si le problème persiste :

1. Copiez l'erreur complète du terminal du serveur
2. Vérifiez que vous avez bien exécuté `npm run init-db`
3. Vérifiez les logs du serveur au moment de l'erreur

