import OpenAI from 'openai';
import logger from '../config/logger.js';

/**
 * Service d'analyse NLP utilisant OpenAI GPT
 */
class NLPService {
  constructor(apiKey) {
    if (!apiKey) {
      logger.warn('Clé OpenAI non configurée');
      this.openai = null;
    } else {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Analyse le texte extrait pour détecter contradictions, propagande, etc.
   */
  async analyzeText(text) {
    try {
      logger.info('Démarrage de l\'analyse sémantique avec GPT...');
      
      if (!this.openai) {
        logger.warn('OpenAI non configuré');
        return {
          score: 50,
          contradictions: [],
          propagandaIndicators: [],
          generatedContentIndicators: [],
          hallucinations: [],
          internalInconsistencies: [],
          biasIndicators: [],
          description: 'Analyse NLP non disponible - clé API manquante',
          confidence: 0
        };
      }
      
      if (!text || text.trim().length < 50) {
        logger.warn('Texte trop court pour l\'analyse NLP');
        return {
          score: 50,
          contradictions: [],
          propagandaIndicators: [],
          generatedContentIndicators: [],
          hallucinations: [],
          internalInconsistencies: [],
          biasIndicators: [],
          description: 'Texte insuffisant pour une analyse approfondie',
          confidence: 0.3
        };
      }

      const prompt = `Analyse ce texte et identifie:
1. Contradictions logiques ou factuelles
2. Indicateurs de propagande ou de manipulation
3. Signes de contenu généré par IA
4. Hallucinations ou affirmations non vérifiables
5. Incohérences internes
6. Biais évidents

Texte à analyser:
${text.substring(0, 3000)}

Réponds en JSON avec cette structure:
{
  "contradictions": ["liste des contradictions"],
  "propagandaIndicators": ["liste des indicateurs"],
  "generatedContentIndicators": ["liste des signes"],
  "hallucinations": ["liste des hallucinations"],
  "internalInconsistencies": ["liste des incohérences"],
  "biasIndicators": ["liste des biais"],
  "overallScore": 0-100,
  "summary": "résumé de l'analyse"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // Utilisation de gpt-4o car gpt-5.1 n'existe pas encore
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse de crédibilité et détection de désinformation. Analyse les textes de manière objective et factuelle.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1500
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      logger.info('Analyse NLP terminée');
      
      return {
        score: analysis.overallScore || 50,
        contradictions: analysis.contradictions || [],
        propagandaIndicators: analysis.propagandaIndicators || [],
        generatedContentIndicators: analysis.generatedContentIndicators || [],
        hallucinations: analysis.hallucinations || [],
        internalInconsistencies: analysis.internalInconsistencies || [],
        biasIndicators: analysis.biasIndicators || [],
        description: analysis.summary || 'Analyse terminée',
        confidence: 0.85
      };
    } catch (error) {
      logger.error('Erreur lors de l\'analyse NLP:', error);
      return {
        score: 50,
        contradictions: [],
        propagandaIndicators: [],
        generatedContentIndicators: [],
        hallucinations: [],
        internalInconsistencies: [],
        biasIndicators: [],
        description: `Erreur lors de l'analyse: ${error.message}`,
        confidence: 0
      };
    }
  }

  /**
   * Analyse la structure et l'intégrité d'un PDF
   */
  async analyzePDFStructure(pdfText, pdfMetadata) {
    try {
      if (!this.openai) {
        logger.warn('OpenAI non configuré pour analyse PDF');
        return {
          integrityScore: 50,
          issues: [],
          description: 'Analyse PDF non disponible - clé API manquante'
        };
      }

      const prompt = `Analyse la structure et l'intégrité de ce document PDF basé sur son contenu texte et ses métadonnées.

Métadonnées:
${JSON.stringify(pdfMetadata, null, 2)}

Extrait de texte (premiers 2000 caractères):
${pdfText.substring(0, 2000)}

Identifie:
1. Incohérences dans la structure
2. Signes de manipulation du document
3. Problèmes de formatage suspects
4. Métadonnées suspectes

Réponds en JSON:
{
  "structureScore": 0-100,
  "issues": ["liste des problèmes"],
  "description": "description de l'intégrité"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse de documents PDF et détection de falsification.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 800
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      return {
        integrityScore: analysis.structureScore || 50,
        issues: analysis.issues || [],
        description: analysis.description || 'Analyse terminée'
      };
    } catch (error) {
      logger.error('Erreur lors de l\'analyse de structure PDF:', error);
      return {
        integrityScore: 50,
        issues: [],
        description: `Erreur: ${error.message}`
      };
    }
  }
}

export default NLPService;

