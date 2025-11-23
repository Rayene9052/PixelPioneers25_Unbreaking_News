/**
 * Modèle Content pour les contenus uploadés
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_path'
  },
  contentType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'content_type'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    field: 'file_size'
  },
  uploadDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'upload_date'
  }
}, {
  tableName: 'contents',
  timestamps: false
});

module.exports = Content;

