/**
 * Modèle ContentAnalysis pour les résultats d'analyse
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContentAnalysis = sequelize.define('ContentAnalysis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  contentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'content_id',
    references: {
      model: 'contents',
      key: 'id'
    }
  },
  aiDetectionScore: {
    type: DataTypes.FLOAT,
    field: 'ai_detection_score'
  },
  aiDetectionConfidence: {
    type: DataTypes.FLOAT,
    field: 'ai_detection_confidence'
  },
  aiDetectionModel: {
    type: DataTypes.STRING,
    field: 'ai_detection_model'
  },
  elaScore: {
    type: DataTypes.FLOAT,
    field: 'ela_score'
  },
  residualAnalysisScore: {
    type: DataTypes.FLOAT,
    field: 'residual_analysis_score'
  },
  metadataConsistencyScore: {
    type: DataTypes.FLOAT,
    field: 'metadata_consistency_score'
  },
  historicalMatchScore: {
    type: DataTypes.FLOAT,
    field: 'historical_match_score'
  },
  variantDetectionScore: {
    type: DataTypes.FLOAT,
    field: 'variant_detection_score'
  },
  alterationDetectionScore: {
    type: DataTypes.FLOAT,
    field: 'alteration_detection_score'
  },
  credibilityScore: {
    type: DataTypes.FLOAT,
    field: 'credibility_score'
  },
  manipulationProbability: {
    type: DataTypes.FLOAT,
    field: 'manipulation_probability'
  },
  analysisDetails: {
    type: DataTypes.JSONB,
    field: 'analysis_details'
  },
  analysisDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'analysis_date'
  }
}, {
  tableName: 'content_analyses',
  timestamps: false
});

module.exports = ContentAnalysis;

