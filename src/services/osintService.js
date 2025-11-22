import { getJson } from 'serpapi';
import logger from '../config/logger.js';
import { readFileSync } from 'fs';
import crypto from 'crypto';

class OSINTService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async reverseImageSearch(imagePath) {
    try {
      logger.info('Démarrage du reverse image search...');
      const imageBuffer = readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Essayer avec google_lens
      let response;
      try {
        response = await getJson({
          engine: 'google_lens',
          image: `data:image/jpeg;base64,${base64Image}`,
          api_key: this.apiKey
        });
      } catch (apiError) {
        logger.warn('Google Lens non disponible, tentative avec Google Images...');
        response = await getJson({
          engine: 'google_images',
          image: `data:image/jpeg;base64,${base64Image}`,
          api_key: this.apiKey
        });
      }

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
    } catch (error) {
      logger.error('Erreur lors du reverse image search:', error);
      return {
        sources: [],
        score: 50,
        occurrenceCount: 0,
        earliestDate: null,
        latestDate: null,
        coherenceScore: 50,
        error: error.message
      };
    }
  }

  async searchText(text, maxResults = 20) {
    try {
      logger.info('Recherche du texte en ligne...');
      const response = await getJson({
        engine: 'google',
        q: `"${text.substring(0, 200)}"`,
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
        error: error.message
      };
    }
  }

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

  calculateOSINTScore(sources) {
    if (sources.length === 0) {
      return 30;
    }
    const baseScore = Math.min(50 + (sources.length * 2), 90);
    const hasRecentSources = sources.some(s => {
      if (!s.date) return false;
      const sourceDate = new Date(s.date);
      const daysAgo = (Date.now() - sourceDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo < 30;
    });
    return hasRecentSources ? Math.min(baseScore + 10, 100) : baseScore;
  }

  calculateCoherenceScore(sources) {
    if (sources.length < 2) return 50;
    const dates = sources
      .map(s => s.date ? new Date(s.date) : null)
      .filter(d => d !== null)
      .sort((a, b) => a - b);
    if (dates.length < 2) return 50;
    const timeSpan = dates[dates.length - 1] - dates[0];
    const daysSpan = timeSpan / (1000 * 60 * 60 * 24);
    if (daysSpan < 365) {
      return 80;
    } else if (daysSpan < 730) {
      return 60;
    } else {
      return 40;
    }
  }

  findEarliestDate(sources) {
    const dates = sources
      .map(s => s.date ? new Date(s.date) : null)
      .filter(d => d !== null)
      .sort((a, b) => a - b);
    return dates.length > 0 ? dates[0].toISOString() : null;
  }

  findLatestDate(sources) {
    const dates = sources
      .map(s => s.date ? new Date(s.date) : null)
      .filter(d => d !== null)
      .sort((a, b) => b - a);
    return dates.length > 0 ? dates[0].toISOString() : null;
  }

  calculateImageHash(buffer) {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }
}

export default OSINTService;
