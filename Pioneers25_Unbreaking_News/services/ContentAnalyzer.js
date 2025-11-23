/**
 * Service principal d'analyse qui orchestre tous les modules
 */
const ImageAIDetector = require('./aiDetection/ImageDetector');
const TextAIDetector = require('./aiDetection/TextDetector');
const AudioAIDetector = require('./aiDetection/AudioDetector');
const ELAAnalyzer = require('./forensics/ELAAnalyzer');
const ResidualAnalyzer = require('./forensics/ResidualAnalyzer');
const MetadataExtractor = require('./forensics/MetadataExtractor');
const HistoricalVerifier = require('./historical/HistoricalVerifier');
const CredibilityScorer = require('./scoring/CredibilityScorer');
const { Content, ContentAnalysis, ContentMetadata } = require('../models');
const fs = require('fs').promises;

class ContentAnalyzer {
  constructor(db) {
    this.db = db;
    
    // Initialiser les détecteurs IA
    this.imageAIDetector = new ImageAIDetector();
    this.textAIDetector = new TextAIDetector();
    this.audioAIDetector = new AudioAIDetector();
    
    // Initialiser les analyseurs forensiques
    this.elaAnalyzer = new ELAAnalyzer();
    this.residualAnalyzer = new ResidualAnalyzer();
    this.metadataExtractor = new MetadataExtractor();
    
    // Initialiser le vérificateur historique
    this.historicalVerifier = new HistoricalVerifier(db);
    
    // Initialiser le scoreur
    this.credibilityScorer = new CredibilityScorer();
  }

  async analyze(filePath, contentType, metadata = null) {
    const results = {
      filePath: filePath,
      contentType: contentType,
      analysisResults: {}
    };

    try {
      // 1. Détection IA
      const aiResult = await this._detectAI(filePath, contentType);
      results.analysisResults.aiDetection = aiResult;

      // 2. Forensique numérique (pour les images)
      if (contentType === 'image') {
        const elaResult = await this.elaAnalyzer.analyze(filePath);
        results.analysisResults.elaAnalysis = elaResult;

        const residualResult = await this.residualAnalyzer.analyze(filePath);
        results.analysisResults.residualAnalysis = residualResult;
      }

      // 3. Extraction de métadonnées
      const metadataResult = await this.metadataExtractor.extract(filePath);
      results.analysisResults.metadata = metadataResult;

      // 4. Vérification de cohérence des métadonnées
      const consistencyResult = this.metadataExtractor.checkConsistency(metadataResult);
      results.analysisResults.metadataConsistency = consistencyResult;

      // 5. Vérification historique
      const historicalResult = await this.historicalVerifier.verify(
        filePath,
        contentType,
        metadataResult
      );
      results.analysisResults.historicalVerification = historicalResult;

      // 6. Comparaison avec archives (si des correspondances trouvées)
      if (historicalResult.similarEntries && historicalResult.similarEntries.length > 0) {
        const bestMatch = historicalResult.similarEntries[0];
        if (bestMatch.details) {
          results.analysisResults.comparison = bestMatch.details;
        }
      }

      // 7. Calcul du score de crédibilité
      const credibilityResult = this.credibilityScorer.calculate(results.analysisResults);
      results.analysisResults.credibility = credibilityResult;

      // Résumé
      results.summary = {
        credibilityScore: credibilityResult.credibilityScore,
        manipulationProbability: credibilityResult.manipulationProbability,
        aiDetectionScore: aiResult.score || 0.5,
        historicalMatchScore: historicalResult.historicalMatchScore || 0.0
      };

      results.status = 'completed';
    } catch (error) {
      results.status = 'error';
      results.error = error.message;
    }

    return results;
  }

  async _detectAI(filePath, contentType) {
    if (contentType === 'image') {
      return await this.imageAIDetector.detect(filePath);
    } else if (contentType === 'text') {
      const text = await fs.readFile(filePath, 'utf-8');
      return this.textAIDetector.detect(text);
    } else if (contentType === 'audio') {
      return await this.audioAIDetector.detect(filePath);
    } else {
      return { score: 0.5, error: 'Type non supporté' };
    }
  }

  async saveAnalysis(contentId, analysisResults) {
    const analysis = await ContentAnalysis.create({
      contentId: contentId,
      aiDetectionScore: analysisResults.aiDetection?.score,
      aiDetectionConfidence: analysisResults.aiDetection?.confidence,
      aiDetectionModel: analysisResults.aiDetection?.modelUsed,
      elaScore: analysisResults.elaAnalysis?.score,
      residualAnalysisScore: analysisResults.residualAnalysis?.score,
      metadataConsistencyScore: analysisResults.metadataConsistency?.score,
      historicalMatchScore: analysisResults.historicalVerification?.historicalMatchScore,
      variantDetectionScore: analysisResults.comparison?.variantScore,
      alterationDetectionScore: analysisResults.comparison?.alterationScore,
      credibilityScore: analysisResults.credibility?.credibilityScore,
      manipulationProbability: analysisResults.credibility?.manipulationProbability,
      analysisDetails: analysisResults
    });

    return analysis;
  }
}

module.exports = ContentAnalyzer;

