/**
 * Routes pour générer des rapports d'analyse
 */
const express = require('express');
const router = express.Router();

const { Content, ContentAnalysis } = require('../models');

// GET /api/v1/reports/content/:content_id
router.get('/content/:content_id', async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.content_id);
    if (!content) {
      return res.status(404).json({ 
        error: 'Contenu non trouvé',
        message: `Aucun contenu trouvé avec l'ID ${req.params.content_id}`,
        hint: 'Assurez-vous d\'avoir uploadé un fichier et d\'utiliser le content_id retourné'
      });
    }

    const analysis = await ContentAnalysis.findOne({
      where: { contentId: req.params.content_id },
      order: [['analysisDate', 'DESC']]
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analyse non trouvée' });
    }

    const report = {
      report_id: `RPT-${content.id}-${analysis.id}`,
      generated_at: new Date().toISOString(),
      content: {
        id: content.id,
        filename: content.filename,
        content_type: content.contentType,
        upload_date: content.uploadDate
      },
      analysis_summary: {
        credibility_score: analysis.credibilityScore,
        manipulation_probability: analysis.manipulationProbability,
        analysis_date: analysis.analysisDate
      },
      detailed_results: {
        ai_detection: {
          score: analysis.aiDetectionScore,
          confidence: analysis.aiDetectionConfidence,
          model: analysis.aiDetectionModel,
          interpretation: interpretAIScore(analysis.aiDetectionScore)
        },
        forensic_analysis: {
          ela_score: analysis.elaScore,
          residual_analysis_score: analysis.residualAnalysisScore,
          interpretation: interpretForensicScores(analysis.elaScore, analysis.residualAnalysisScore)
        },
        metadata_consistency: {
          score: analysis.metadataConsistencyScore,
          interpretation: interpretMetadataScore(analysis.metadataConsistencyScore)
        },
        historical_verification: {
          match_score: analysis.historicalMatchScore,
          interpretation: interpretHistoricalScore(analysis.historicalMatchScore)
        },
        alteration_detection: {
          variant_score: analysis.variantDetectionScore,
          alteration_score: analysis.alterationDetectionScore,
          interpretation: interpretAlterationScores(analysis.variantDetectionScore, analysis.alterationDetectionScore)
        }
      },
      credibility_assessment: {
        overall_score: analysis.credibilityScore,
        risk_level: getRiskLevel(analysis.credibilityScore),
        recommendations: getRecommendations(analysis)
      },
      full_analysis_details: analysis.analysisDetails
    };

    res.json(report);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur', message: error.message });
  }
});

function interpretAIScore(score) {
  if (score === null || score === undefined) return 'Non analysé';
  if (score > 0.7) return 'Probabilité élevée de génération par IA';
  if (score > 0.5) return 'Probabilité modérée de génération par IA';
  return 'Probabilité faible de génération par IA';
}

function interpretForensicScores(elaScore, residualScore) {
  if ((elaScore === null || elaScore === undefined) && (residualScore === null || residualScore === undefined)) {
    return 'Non analysé';
  }
  const maxScore = Math.max(elaScore || 0, residualScore || 0);
  if (maxScore > 0.7) return 'Signes de manipulation détectés';
  if (maxScore > 0.5) return 'Signes modérés de manipulation';
  return 'Aucun signe évident de manipulation';
}

function interpretMetadataScore(score) {
  if (score === null || score === undefined) return 'Non analysé';
  if (score > 0.8) return 'Métadonnées cohérentes';
  if (score > 0.6) return 'Métadonnées partiellement cohérentes';
  return 'Incohérences détectées dans les métadonnées';
}

function interpretHistoricalScore(score) {
  if (score === null || score === undefined) return 'Non analysé';
  if (score > 0.7) return 'Forte correspondance avec les archives';
  if (score > 0.5) return 'Correspondance modérée avec les archives';
  if (score > 0.3) return 'Correspondance faible avec les archives';
  return 'Aucune correspondance trouvée dans les archives';
}

function interpretAlterationScores(variantScore, alterationScore) {
  if ((variantScore === null || variantScore === undefined) && (alterationScore === null || alterationScore === undefined)) {
    return 'Non analysé';
  }
  if (alterationScore && alterationScore > 0.7) return 'Altérations suspectes détectées';
  if (variantScore && variantScore > 0.5) return 'Variantes détectées (probablement légitimes)';
  return 'Peu ou pas de variantes/altérations détectées';
}

function getRiskLevel(credibilityScore) {
  if (credibilityScore === null || credibilityScore === undefined) return 'INCONNU';
  if (credibilityScore > 0.8) return 'FAIBLE';
  if (credibilityScore > 0.6) return 'MODÉRÉ';
  if (credibilityScore > 0.4) return 'ÉLEVÉ';
  return 'TRÈS ÉLEVÉ';
}

function getRecommendations(analysis) {
  const recommendations = [];

  if (analysis.credibilityScore && analysis.credibilityScore < 0.5) {
    recommendations.push('⚠️ Crédibilité faible: vérification manuelle recommandée');
  }
  if (analysis.aiDetectionScore && analysis.aiDetectionScore > 0.7) {
    recommendations.push('⚠️ Probabilité élevée de génération par IA détectée');
  }
  if (analysis.alterationDetectionScore && analysis.alterationDetectionScore > 0.7) {
    recommendations.push('⚠️ Altérations suspectes détectées dans le contenu');
  }
  if (analysis.metadataConsistencyScore && analysis.metadataConsistencyScore < 0.6) {
    recommendations.push('⚠️ Incohérences dans les métadonnées détectées');
  }
  if (analysis.historicalMatchScore && analysis.historicalMatchScore < 0.3) {
    recommendations.push('ℹ️ Aucune correspondance trouvée dans les archives historiques');
  }
  if (recommendations.length === 0) {
    recommendations.push('✓ Aucun problème majeur détecté');
  }

  return recommendations;
}

module.exports = router;

