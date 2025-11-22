# Guide d'Intégration Frontend

Ce guide explique comment intégrer le backend avec un frontend React ou Next.js.

## Configuration CORS

Le backend est déjà configuré pour accepter les requêtes depuis n'importe quelle origine. Pour restreindre à un domaine spécifique, modifiez `src/server.js` :

```javascript
res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
```

## Exemple d'Upload d'Image (React)

```javascript
import React, { useState } from 'react';

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:3000/api/upload-image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Analyse en cours...' : 'Analyser'}
      </button>
      
      {result && (
        <div>
          <h3>Score de crédibilité: {result.data.finalScore}/100</h3>
          <pre>{JSON.stringify(result.data.report, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}

export default ImageUpload;
```

## Exemple avec Next.js (API Route)

Créez `pages/api/analyze.js` :

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const formData = new FormData();
  formData.append('image', req.body.file);

  const response = await fetch('http://localhost:3000/api/upload-image', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  res.status(200).json(data);
}
```

## Structure de la Réponse

```typescript
interface AnalysisResult {
  success: boolean;
  data: {
    fileType: 'image' | 'video' | 'pdf';
    hash: string;
    finalScore: number; // 0-100
    timestamp: string;
    forensic: {
      manipulationScore: number;
      deepfakeScore: number;
      signals: string[];
      description: string;
    };
    osint: {
      score: number;
      sources: Array<{
        url: string;
        title: string;
        date: string | null;
      }>;
      occurrenceCount: number;
    };
    nlp: {
      score: number;
      contradictions: string[];
      description: string;
    };
    hedera: {
      success: boolean;
      fileId: string | null;
      proof: object | null;
    };
    report: {
      summary: object;
      redFlags: string[];
      crediblePoints: string[];
      explanation: string;
    };
  };
}
```

## Gestion des Erreurs

```javascript
try {
  const response = await fetch('http://localhost:3000/api/upload-image', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur serveur');
  }

  const data = await response.json();
  // Traiter les données
} catch (error) {
  console.error('Erreur:', error.message);
  // Afficher un message d'erreur à l'utilisateur
}
```

## Affichage du Score

```javascript
function ScoreDisplay({ score }) {
  const getColor = () => {
    if (score >= 70) return 'green';
    if (score >= 40) return 'orange';
    return 'red';
  };

  return (
    <div>
      <h2 style={{ color: getColor() }}>
        Score de crédibilité: {score}/100
      </h2>
      <div className="progress-bar">
        <div 
          style={{ 
            width: `${score}%`, 
            backgroundColor: getColor() 
          }}
        />
      </div>
    </div>
  );
}
```

## Vérification de Santé

```javascript
async function checkBackendHealth() {
  const response = await fetch('http://localhost:3000/api/health');
  const data = await response.json();
  
  console.log('Services disponibles:', data.services);
  return data.status === 'ok';
}
```

