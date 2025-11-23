import { getJson } from "serpapi";
import logger from '../config/logger.js';
import { readFileSync } from 'fs';
import crypto from 'crypto';
import FormData from 'form-data';
import fetch from 'node-fetch';

/**
 * Service OSINT utilisant SerpAPI pour reverse image search et recherche de texte
 */
class OSINTService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Effectue un reverse image search sur une image
   */
  async reverseImageSearch(imagePath) {
    try {
      logger.info('Démarrage du reverse image search...');
      
      if (!this.apiKey) {
        logger.warn('Clé SerpAPI non configurée');
        return this.getDefaultResult('Clé API non configurée');
      }

      const imageBuffer = readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      // Utilisation de SerpAPI avec Google Lens pour reverse image search
      // SerpAPI supporte l'upload d'image via base64
      try {
        const response = await getJson({
          engine: 'google_lens',
          image: `data:image/jpeg;base64,${base64Image}`,
          api_key: this.apiKey
        });

        const sources = this.extractSources(response);
        const score = this.calculateOSINTScore(sources);
        
        logger.info(`Reverse image search terminé: ${sources.length} sources trouvées`);
        
        return {
          sources,
          score,
          occurrenceCount: sources.length,
          earliestDate: this.findEarliestDate(sources),
          latestDate: this.findLatestDate(sources),
          coherenceScore: this.calculateCoherenceScore(sources)
        };
      } catch (apiError) {
        // Si Google Lens ne fonctionne pas, essayer Google Images avec recherche visuelle
        logger.warn('Google Lens non disponible, tentative avec Google Images...');
        
        try {
          const response = await getJson({
            engine: 'google_images',
            image: `data:image/jpeg;base64,${base64Image}`,
            api_key: this.apiKey
          });

          const sources = this.extractSources(response);
          const score = this.calculateOSINTScore(sources);
          
          logger.info(`Reverse image search (Google Images) terminé: ${sources.length} sources trouvées`);
          
          return {
            sources,
            score,
            occurrenceCount: sources.length,
            earliestDate: this.findEarliestDate(sources),
            latestDate: this.findLatestDate(sources),
            coherenceScore: this.calculateCoherenceScore(sources)
          };
        } catch (fallbackError) {
          logger.error('Erreur lors du reverse image search (fallback):', fallbackError);
          return this.getDefaultResult(fallbackError.message);
        }
      }
    } catch (error) {
      logger.error('Erreur lors du reverse image search:', error);
      return this.getDefaultResult(error.message);
    }
  }

  /**
   * Retourne un résultat par défaut en cas d'erreur
   */
  getDefaultResult(errorMessage) {
    return {
      sources: [],
      score: 50,
      occurrenceCount: 0,
      earliestDate: null,
      latestDate: null,
      coherenceScore: 50,
      error: errorMessage,
      description: 'Reverse image search non disponible'
    };
  }

  /**
   * Recherche du texte extrait d'un PDF
   */
  async searchText(text, maxResults = 20) {
    try {
      logger.info('Recherche du texte en ligne...');
      
      if (!this.apiKey) {
        logger.warn('Clé SerpAPI non configurée');
        return {
          sources: [],
          score: 50,
          occurrenceCount: 0,
          earliestDate: null,
          latestDate: null,
          coherenceScore: 50,
          error: 'Clé API non configurée',
          description: 'Recherche texte non disponible'
        };
      }

      if (!text || text.trim().length < 20) {
        logger.warn('Texte trop court pour recherche');
        return {
          sources: [],
          score: 50,
          occurrenceCount: 0,
          earliestDate: null,
          latestDate: null,
          coherenceScore: 50,
          description: 'Texte insuffisant pour recherche'
        };
      }
      
      // Extraire des phrases clés pour la recherche
      const keyPhrases = this.extractKeyPhrases(text);
      const searchQuery = keyPhrases[0] || text.substring(0, 100);
      
      // Recherche Google avec SerpAPI
      const response = await getJson({
        engine: 'google',
        q: `"${searchQuery}"`,
        num: maxResults,
        api_key: this.apiKey
      });

      const sources = this.extractTextSources(response);
      const score = this.calculateOSINTScore(sources);
      
      logger.info(`Recherche texte terminée: ${sources.length} sources trouvées`);
      
      return {
        sources,
        score,
        occurrenceCount: sources.length,
        earliestDate: this.findEarliestDate(sources),
        latestDate: this.findLatestDate(sources),
        coherenceScore: this.calculateCoherenceScore(sources)
      };
    } catch (error) {
      logger.error('Erreur lors de la recherche de texte:', error);
      return {
        sources: [],
        score: 50,
        occurrenceCount: 0,
        earliestDate: null,
        latestDate: null,
        coherenceScore: 50,
        error: error.message,
        description: 'Recherche texte non disponible'
      };
    }
  }

  /**
   * Extrait des phrases clés du texte pour la recherche
   */
  extractKeyPhrases(text) {
    // Extraire les phrases les plus significatives (simplifié)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).map(s => s.trim().substring(0, 100));
  }

  /**
   * Extrait les sources des résultats de reverse image search
   */
  extractSources(serpResponse) {
    const sources = [];
    
    if (serpResponse.visual_matches) {
      for (const match of serpResponse.visual_matches) {
        sources.push({
          url: match.link || match.source || '',
          title: match.title || '',
          date: match.date || null,
          source: match.source || 'Unknown',
          thumbnail: match.thumbnail || null
        });
      }
    }

    if (serpResponse.organic_results) {
      for (const result of serpResponse.organic_results) {
        sources.push({
          url: result.link || '',
          title: result.title || '',
          date: result.date || null,
          source: result.source || 'Unknown',
          snippet: result.snippet || null
        });
      }
    }

    return sources;
  }

  /**
   * Extrait les sources des résultats de recherche de texte
   */
  extractTextSources(serpResponse) {
    const sources = [];
    
    if (serpResponse.organic_results) {
      for (const result of serpResponse.organic_results) {
        sources.push({
          url: result.link || '',
          title: result.title || '',
          date: result.date || null,
          source: result.source || 'Unknown',
          snippet: result.snippet || null
        });
      }
    }

    return sources;
  }

  /**
   * Calcule le score OSINT basé sur les sources trouvées
   */
  calculateOSINTScore(sources) {
    if (sources.length === 0) {
      return 30; // Pas de sources = suspect mais pas forcément fake
    }

    // Plus il y a de sources, plus c'est crédible (jusqu'à un certain point)
    const baseScore = Math.min(50 + (sources.length * 2), 90);
    
    // Bonus si sources récentes et cohérentes
    const hasRecentSources = sources.some(s => {
      if (!s.date) return false;
      const sourceDate = new Date(s.date);
      const daysAgo = (Date.now() - sourceDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo < 30;
    });

    return hasRecentSources ? Math.min(baseScore + 10, 100) : baseScore;
  }

  /**
   * Calcule le score de cohérence des dates
   */
  calculateCoherenceScore(sources) {
    if (sources.length < 2) {
      return 50;
    }

    const dates = sources
      .map(s => s.date ? new Date(s.date) : null)
      .filter(d => d !== null)
      .sort((a, b) => a - b);

    if (dates.length < 2) {
      return 50;
    }

    // Vérifie si les dates sont cohérentes (pas trop dispersées)
    const timeSpan = dates[dates.length - 1] - dates[0];
    const daysSpan = timeSpan / (1000 * 60 * 60 * 24);

    // Si les dates sont sur une période raisonnable (< 1 an), c'est cohérent
    if (daysSpan < 365) {
      return 80;
    } else if (daysSpan < 730) {
      return 60;
    } else {
      return 40;
    }
  }

  /**
   * Trouve la date la plus ancienne
   */
  findEarliestDate(sources) {
    const dates = sources
      .map(s => s.date ? new Date(s.date) : null)
      .filter(d => d !== null)
      .sort((a, b) => a - b);
    
    return dates.length > 0 ? dates[0].toISOString() : null;
  }

  /**
   * Trouve la date la plus récente
   */
  findLatestDate(sources) {
    const dates = sources
      .map(s => s.date ? new Date(s.date) : null)
      .filter(d => d !== null)
      .sort((a, b) => b - a);
    
    return dates.length > 0 ? dates[0].toISOString() : null;
  }

  /**
   * Calcule un hash simple de l'image (pour référence)
   */
  calculateImageHash(buffer) {
    // Hash simple pour référence (en production, utiliser un hash perceptuel)
    return crypto.createHash('md5').update(buffer).digest('hex');
  }
}






export default OSINTService;

