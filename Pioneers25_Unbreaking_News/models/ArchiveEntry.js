/**
 * Modèle ArchiveEntry pour les entrées d'archive
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ArchiveEntry = sequelize.define('ArchiveEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  archiveId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'archive_id',
    references: {
      model: 'archives',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  contentType: {
    type: DataTypes.STRING,
    field: 'content_type'
  },
  filePath: {
    type: DataTypes.STRING,
    field: 'file_path'
  },
  historicalDate: {
    type: DataTypes.DATE,
    field: 'historical_date'
  },
  location: {
    type: DataTypes.STRING
  },
  sourceReference: {
    type: DataTypes.STRING,
    field: 'source_reference'
  },
  validationStatus: {
    type: DataTypes.STRING,
    field: 'validation_status'
  },
  metadata: {
    type: DataTypes.JSONB
  },
  tags: {
    type: DataTypes.JSONB
  },
  indexedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'indexed_date'
  }
}, {
  tableName: 'archive_entries',
  timestamps: false
});

module.exports = ArchiveEntry;

