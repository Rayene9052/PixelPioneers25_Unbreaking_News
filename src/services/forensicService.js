import logger from '../config/logger.js';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';

/**
 * Service d'analyse forensique utilisant Hive AI
 */
class ForensicService {
  constructor(accessKey, secretKey) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    // Si seulement accessKey est fourni (rétrocompatibilité), on l'utilise comme apiKey
    this.apiKey = accessKey || secretKey;
    this.baseUrl = 'https://api.thehive.ai/api/v2';
  }

  /**
   * Analyse une image avec Hive AI pour détecter les manipulations et deepfakes
   */
  async analyzeImage(imagePath) {
    try {
      logger.info('Démarrage de l\'analyse forensique de l\'image...');
      
      if (!this.accessKey && !this.apiKey) {
        logger.warn('Clés Hive AI non configurées');
        return {
          manipulationScore: 50,
          deepfakeScore: 50,
          errorLevelScore: 50,
          description: 'Analyse forensique non disponible - clés API manquantes',
          signals: [],
          confidence: 0
        };
      }

      const imageBuffer = readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      // Appel à l'API Hive AI
      // Utilisation de l'access key pour l'authentification
      const authToken = this.accessKey || this.apiKey;
      
      // Hive AI accepte les images en base64 dans le body JSON
      const response = await fetch(`${this.baseUrl}/task/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: `data:image/jpeg;base64,${base64Image}`,
          models: ['deepfake', 'error_level_analysis', 'manipulation']
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Erreur API Hive AI (${response.status}):`, errorText);
        
        // Si c'est une erreur d'authentification, retourner un résultat par défaut
        if (response.status === 401 || response.status === 403) {
          return {
            manipulationScore: 50,
            deepfakeScore: 50,
            errorLevelScore: 50,
            description: 'Erreur d\'authentification Hive AI - vérifiez vos clés API',
            signals: [],
            confidence: 0
          };
        }
        
        throw new Error(`Hive AI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      // Traitement des résultats
      const analysis = this.processHiveResults(result);
      
      logger.info('Analyse forensique terminée');
      return analysis;
    } catch (error) {
      logger.error('Erreur lors de l\'analyse forensique:', error);
      // Retourner un résultat par défaut en cas d'erreur
      return {
        manipulationScore: 50,
        deepfakeScore: 50,
        errorLevelScore: 50,
        description: `Erreur lors de l'analyse: ${error.message}`,
        signals: [],
        confidence: 0
      };
    }
  }

  /**
   * Analyse plusieurs images (pour les vidéos)
   */
  async analyzeMultipleImages(imagePaths) {
    logger.info(`Analyse de ${imagePaths.length} images...`);
    
    const analyses = await Promise.allSettled(
      imagePaths.map(path => this.analyzeImage(path))
    );

    const results = analyses
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    // Agrégation des résultats
    const avgManipulationScore = results.length > 0
      ? results.reduce((sum, r) => sum + r.manipulationScore, 0) / results.length
      : 50;

    const avgDeepfakeScore = results.length > 0
      ? results.reduce((sum, r) => sum + r.deepfakeScore, 0) / results.length
      : 50;

    const allSignals = results.flatMap(r => r.signals);
    const uniqueSignals = [...new Set(allSignals)];

    return {
      manipulationScore: avgManipulationScore,
      deepfakeScore: avgDeepfakeScore,
      errorLevelScore: results.length > 0
        ? results.reduce((sum, r) => sum + r.errorLevelScore, 0) / results.length
        : 50,
      description: `Analyse de ${results.length} frames: ${uniqueSignals.length} signaux détectés`,
      signals: uniqueSignals,
      frameAnalyses: results,
      confidence: results.length > 0 ? 0.8 : 0
    };
  }

  /**
   * Traite les résultats de l'API Hive AI
   */
  processHiveResults(hiveResult) {
    const signals = [];
    let manipulationScore = 50;
    let deepfakeScore = 50;
    let errorLevelScore = 50;

    // Analyse des modèles retournés
    if (hiveResult.status === 'completed' && hiveResult.output) {
      const output = hiveResult.output;

      // Deepfake detection
      // Note: Tous les scores sont normalisés pour représenter le niveau de manipulation (0-100)
      // Plus le score est élevé, plus la manipulation est probable
      if (output.deepfake) {
        const deepfakeConfidence = output.deepfake.confidence || 0;
        deepfakeScore = deepfakeConfidence * 100; // Score brut de manipulation (non inversé)
        
        if (deepfakeConfidence > 0.7) {
          signals.push('deepfake_high_confidence');
        } else if (deepfakeConfidence > 0.5) {
          signals.push('deepfake_medium_confidence');
        }
      }

      // Error Level Analysis
      if (output.error_level_analysis) {
        const elaScore = output.error_level_analysis.score || 0;
        errorLevelScore = elaScore * 100; // Score brut de manipulation (non inversé)
        
        if (elaScore > 0.7) {
          signals.push('high_error_level');
        } else if (elaScore > 0.5) {
          signals.push('medium_error_level');
        }
      }

      // Manipulation detection
      if (output.manipulation) {
        const manipScore = output.manipulation.confidence || 0;
        manipulationScore = manipScore * 100; // Score brut de manipulation (non inversé)
        
        if (manipScore > 0.7) {
          signals.push('manipulation_detected');
        } else if (manipScore > 0.5) {
          signals.push('possible_manipulation');
        }
      }
    }

    // Score global de manipulation (moyenne pondérée)
    const overallManipulationScore = (
      manipulationScore * 0.4 +
      deepfakeScore * 0.4 +
      errorLevelScore * 0.2
    );

    return {
      manipulationScore: Math.round(overallManipulationScore),
      deepfakeScore: Math.round(deepfakeScore),
      errorLevelScore: Math.round(errorLevelScore),
      description: this.generateDescription(signals, overallManipulationScore),
      signals,
      confidence: hiveResult.status === 'completed' ? 0.9 : 0.5
    };
  }

  /**
   * Génère une description des résultats
   */
  generateDescription(signals, score) {
    if (signals.length === 0) {
      return 'Aucun signe de manipulation détecté. L\'image semble authentique.';
    }

    const descriptions = {
      'deepfake_high_confidence': 'Deepfake détecté avec une forte confiance',
      'deepfake_medium_confidence': 'Possible deepfake détecté',
      'high_error_level': 'Niveau d\'erreur élevé suggérant une manipulation',
      'medium_error_level': 'Niveau d\'erreur modéré détecté',
      'manipulation_detected': 'Manipulation détectée',
      'possible_manipulation': 'Manipulation possible'
    };

    const signalDescriptions = signals.map(s => descriptions[s] || s).join(', ');
    return `Signaux détectés: ${signalDescriptions}. Score de manipulation: ${score.toFixed(1)}/100.`;
  }
}

export default ForensicService;

