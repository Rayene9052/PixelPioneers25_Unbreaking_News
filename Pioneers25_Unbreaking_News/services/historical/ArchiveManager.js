/**
 * Gestionnaire d'archives historiques
 */
const { Client } = require('@elastic/elasticsearch');
const { Archive, ArchiveEntry } = require('../../models');

class ArchiveManager {
  constructor(db) {
    this.db = db;
    this.es = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });
    this.indexName = process.env.ELASTICSEARCH_INDEX || 'histified_content';
  }

  async indexEntry(entry) {
    try {
      const doc = {
        archive_id: entry.archiveId,
        title: entry.title,
        description: entry.description,
        content_type: entry.contentType,
        historical_date: entry.historicalDate ? entry.historicalDate.toISOString() : null,
        location: entry.location,
        source_reference: entry.sourceReference,
        validation_status: entry.validationStatus,
        tags: entry.tags || [],
        metadata: entry.metadata || {}
      };

      await this.es.index({
        index: this.indexName,
        id: entry.id.toString(),
        document: doc
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'indexation:', error);
      return false;
    }
  }

  async searchSimilar(query, contentType = null) {
    try {
      const searchQuery = {
        bool: {
          must: []
        }
      };

      // Filtrer par type de contenu
      if (contentType) {
        searchQuery.bool.must.push({
          term: { content_type: contentType }
        });
      }

      // Recherche par date
      if (query.date) {
        searchQuery.bool.must.push({
          range: {
            historical_date: {
              gte: query.date,
              lte: query.date
            }
          }
        });
      }

      // Recherche par localisation
      if (query.location) {
        searchQuery.bool.must.push({
          match: { location: query.location }
        });
      }

      // Recherche par tags
      if (query.tags && Array.isArray(query.tags)) {
        searchQuery.bool.must.push({
          terms: { tags: query.tags }
        });
      }

      // Recherche textuelle
      if (query.text) {
        searchQuery.bool.must.push({
          multi_match: {
            query: query.text,
            fields: ['title^2', 'description', 'source_reference']
          }
        });
      }

      const result = await this.es.search({
        index: this.indexName,
        query: searchQuery,
        size: 50
      });

      return result.hits.hits.map(hit => ({
        id: hit._id,
        score: hit._score,
        source: hit._source
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
  }

  async getValidatedEntries(dateRange = null) {
    const { Op } = require('sequelize');
    const where = { validationStatus: 'validated' };

    if (dateRange) {
      if (dateRange.start) {
        where.historicalDate = { ...where.historicalDate, [Op.gte]: dateRange.start };
      }
      if (dateRange.end) {
        where.historicalDate = { ...where.historicalDate, [Op.lte]: dateRange.end };
      }
    }

    return await ArchiveEntry.findAll({ where });
  }

  async createArchive(name, description, source) {
    const archive = await Archive.create({
      name,
      description,
      source
    });

    return archive;
  }

  async addEntry(archiveId, entryData) {
    const entry = await ArchiveEntry.create({
      archiveId,
      ...entryData,
      validationStatus: entryData.validationStatus || 'validated'
    });

    // Indexer dans Elasticsearch
    await this.indexEntry(entry);

    return entry;
  }
}

module.exports = ArchiveManager;

