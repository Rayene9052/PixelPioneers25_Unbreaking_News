/**
 * Système de scoring pondéré pour évaluer la crédibilité
 */
class CredibilityScorer {
  constructor() {
    this.defaultWeights = {
      aiDetection: 0.25,
      elaAnalysis: 0.20,
      residualAnalysis: 0.15,
      metadataConsistency: 0.15,
      historicalMatch: 0.15,
      alterationDetection: 0.10
    };
  }

  calculate(analysisResults, weights = null) {
    const w = weights || this.defaultWeights;

    // Normaliser les poids
    const totalWeight = Object.values(w).reduce((a, b) => a + b, 0);
    const normalizedWeights = {};
    for (const [key, value] of Object.entries(w)) {
      normalizedWeights[key] = totalWeight > 0 ? value / totalWeight : 0;
    }

    const scores = {};
    const breakdown = {};

    // Score de détection IA (inversé: plus élevé = moins crédible)
    if (analysisResults.aiDetection) {
      const aiScore = analysisResults.aiDetection.score || 0.5;
      scores.aiDetection = 1.0 - aiScore;
      breakdown.aiDetection = {
        rawScore: aiScore,
        credibilityComponent: scores.aiDetection,
        weight: normalizedWeights.aiDetection || 0.0
      };
    } else {
      scores.aiDetection = 0.5;
      breakdown.aiDetection = { note: 'Non analysé' };
    }

    // Score ELA (inversé)
    if (analysisResults.elaAnalysis) {
      const elaScore = analysisResults.elaAnalysis.score || 0.5;
      scores.elaAnalysis = 1.0 - elaScore;
      breakdown.elaAnalysis = {
        rawScore: elaScore,
        credibilityComponent: scores.elaAnalysis,
        weight: normalizedWeights.elaAnalysis || 0.0
      };
    } else {
      scores.elaAnalysis = 0.5;
      breakdown.elaAnalysis = { note: 'Non analysé' };
    }

    // Score d'analyse des résidus (inversé)
    if (analysisResults.residualAnalysis) {
      const residualScore = analysisResults.residualAnalysis.score || 0.5;
      scores.residualAnalysis = 1.0 - residualScore;
      breakdown.residualAnalysis = {
        rawScore: residualScore,
        credibilityComponent: scores.residualAnalysis,
        weight: normalizedWeights.residualAnalysis || 0.0
      };
    } else {
      scores.residualAnalysis = 0.5;
      breakdown.residualAnalysis = { note: 'Non analysé' };
    }

    // Score de cohérence des métadonnées (direct)
    if (analysisResults.metadataConsistency) {
      const metadataScore = analysisResults.metadataConsistency.score || 0.5;
      scores.metadataConsistency = metadataScore;
      breakdown.metadataConsistency = {
        rawScore: metadataScore,
        credibilityComponent: scores.metadataConsistency,
        weight: normalizedWeights.metadataConsistency || 0.0
      };
    } else {
      scores.metadataConsistency = 0.5;
      breakdown.metadataConsistency = { note: 'Non analysé' };
    }

    // Score de correspondance historique (direct)
    if (analysisResults.historicalVerification) {
      const histScore = analysisResults.historicalVerification.historicalMatchScore || 0.0;
      scores.historicalMatch = histScore;
      breakdown.historicalMatch = {
        rawScore: histScore,
        credibilityComponent: scores.historicalMatch,
        weight: normalizedWeights.historicalMatch || 0.0
      };
    } else {
      scores.historicalMatch = 0.0;
      breakdown.historicalMatch = { note: 'Non analysé' };
    }

    // Score de détection d'altérations (inversé)
    if (analysisResults.comparison) {
      const altScore = analysisResults.comparison.alterationScore || 0.5;
      scores.alterationDetection = 1.0 - altScore;
      breakdown.alterationDetection = {
        rawScore: altScore,
        credibilityComponent: scores.alterationDetection,
        weight: normalizedWeights.alterationDetection || 0.0
      };
    } else {
      scores.alterationDetection = 0.5;
      breakdown.alterationDetection = { note: 'Non analysé' };
    }

    // Calculer le score pondéré final
    let credibilityScore = 0.0;
    for (const [key, weight] of Object.entries(normalizedWeights)) {
      credibilityScore += (scores[key] || 0.5) * weight;
    }

    // Probabilité de manipulation (inverse du score de crédibilité)
    const manipulationProbability = 1.0 - credibilityScore;

    // Ajouter les contributions pondérées au breakdown
    for (const key in breakdown) {
      if (breakdown[key].weight !== undefined) {
        breakdown[key].weightedContribution = (scores[key] || 0.5) * breakdown[key].weight;
      }
    }

    return {
      credibilityScore: credibilityScore,
      manipulationProbability: manipulationProbability,
      breakdown: breakdown,
      weightsUsed: normalizedWeights
    };
  }
}

module.exports = CredibilityScorer;

