/**
 * Modèle Archive pour les collections d'archives
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Archive = sequelize.define('Archive', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  source: {
    type: DataTypes.STRING
  },
  createdDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_date'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    field: 'last_updated'
  }
}, {
  tableName: 'archives',
  timestamps: false
});

module.exports = Archive;

