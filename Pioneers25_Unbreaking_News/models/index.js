/**
 * Index des modèles avec associations
 */
const Content = require('./Content');
const ContentAnalysis = require('./ContentAnalysis');
const ContentMetadata = require('./ContentMetadata');
const Archive = require('./Archive');
const ArchiveEntry = require('./ArchiveEntry');

// Associations
const associateModels = () => {
  Content.hasMany(ContentAnalysis, { foreignKey: 'contentId', as: 'analyses' });
  ContentAnalysis.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });

  Content.hasOne(ContentMetadata, { foreignKey: 'contentId', as: 'metadata' });
  ContentMetadata.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });

  Archive.hasMany(ArchiveEntry, { foreignKey: 'archiveId', as: 'entries' });
  ArchiveEntry.belongsTo(Archive, { foreignKey: 'archiveId', as: 'archive' });
};

// Initialiser les associations
associateModels();

module.exports = {
  Content,
  ContentAnalysis,
  ContentMetadata,
  Archive,
  ArchiveEntry
};

