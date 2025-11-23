# Guide de Test - Histified Backend (Express.js)

Ce guide explique comment tester le backend Histified construit avec Express.js.

## Prérequis

1. Installer les dépendances :
```bash
npm install
```

2. Configurer la base de données (optionnel pour les tests unitaires qui peuvent utiliser SQLite)

3. Démarrer le serveur (pour les tests d'intégration) :
```bash
npm run dev
```

## Types de Tests

### 1. Tests Unitaires

Les tests unitaires testent chaque module individuellement.

**Exécuter tous les tests unitaires :**
```bash
npm test
```

**Exécuter un fichier de test spécifique :**
```bash
npm test -- tests/services/aiDetection.test.js
```

**Mode watch (re-exécute les tests à chaque changement) :**
```bash
npm run test:watch
```

**Avec couverture de code :**
```bash
npm run test:coverage
```

### 2. Tests d'Intégration API

Les tests d'intégration testent les endpoints API.

**Exécuter les tests API :**
```bash
npm test -- tests/content.test.js
```

**Avec verbosité :**
```bash
npm test -- --verbose
```

### 3. Tests Manuels avec curl

Vous pouvez tester l'API directement avec curl :

### Health Check
```bash
curl http://localhost:8000/health
```

### Upload d'image
```bash
curl -X POST "http://localhost:8000/api/v1/content/upload" \
  -F "file=@path/to/image.jpg"
```

### Analyse d'un contenu
```bash
curl -X POST "http://localhost:8000/api/v1/content/analyze" \
  -H "Content-Type: application/json" \
  -d '{"content_id": 1}'
```

### Récupérer un contenu
```bash
curl http://localhost:8000/api/v1/content/1
```

### Générer un rapport
```bash
curl http://localhost:8000/api/v1/reports/content/1
```

## Tests avec Postman

1. Importer la collection Postman (à créer)
2. Configurer l'URL de base : `http://localhost:8000`
3. Tester les endpoints interactivement

## Structure des Tests

```
tests/
├── content.test.js              # Tests endpoints API
└── services/
    └── aiDetection.test.js     # Tests détection IA
```

## Fixtures Disponibles

Les tests utilisent Jest avec des mocks et des données de test créées dynamiquement.

## Exemples de Tests

### Test d'un détecteur IA

```javascript
describe('ImageAIDetector', () => {
  it('devrait détecter une image et retourner un score', async () => {
    const detector = new ImageAIDetector();
    const result = await detector.detect(testImagePath);
    
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});
```

### Test d'un endpoint API

```javascript
describe('POST /api/v1/content/upload', () => {
  it('devrait uploader un fichier image', async () => {
    const response = await request(app)
      .post('/api/v1/content/upload')
      .attach('file', Buffer.from('fake image data'), 'test.jpg');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('content_id');
  });
});
```

## Débogage

**Exécuter avec sortie détaillée :**
```bash
npm test -- --verbose
```

**Exécuter seulement les tests qui ont échoué :**
```bash
npm test -- --onlyFailures
```

**Exécuter un test spécifique :**
```bash
npm test -- -t "devrait uploader un fichier"
```

## Tests de Performance

Pour tester les performances, utilisez un outil comme `autocannon` :

```bash
npm install -g autocannon
autocannon http://localhost:8000/api/v1/content/upload
```

## Notes

- Les tests unitaires peuvent utiliser des mocks pour la base de données
- Les tests d'intégration nécessitent que le serveur soit démarré
- Les fichiers de test sont créés dans des répertoires temporaires
- Les tests sont isolés : chaque test nettoie après lui-même
