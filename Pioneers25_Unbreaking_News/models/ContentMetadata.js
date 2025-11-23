/**
 * Modèle ContentMetadata pour les métadonnées extraites
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContentMetadata = sequelize.define('ContentMetadata', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  contentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'content_id',
    references: {
      model: 'contents',
      key: 'id'
    }
  },
  exifData: {
    type: DataTypes.JSONB,
    field: 'exif_data'
  },
  creationDate: {
    type: DataTypes.DATE,
    field: 'creation_date'
  },
  modificationDate: {
    type: DataTypes.DATE,
    field: 'modification_date'
  },
  author: {
    type: DataTypes.STRING
  },
  software: {
    type: DataTypes.STRING
  },
  deviceInfo: {
    type: DataTypes.JSONB,
    field: 'device_info'
  },
  dimensions: {
    type: DataTypes.STRING
  },
  formatInfo: {
    type: DataTypes.JSONB,
    field: 'format_info'
  },
  compressionInfo: {
    type: DataTypes.JSONB,
    field: 'compression_info'
  }
}, {
  tableName: 'content_metadata',
  timestamps: false
});

module.exports = ContentMetadata;

