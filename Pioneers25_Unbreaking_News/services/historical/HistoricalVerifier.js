/**
 * Vérificateur historique pour comparer les contenus avec les archives
 */
const ArchiveManager = require('./ArchiveManager');
const PerceptualComparator = require('./PerceptualComparator');
const { ArchiveEntry } = require('../../models');

class HistoricalVerifier {
  constructor(db) {
    this.archiveManager = new ArchiveManager(db);
    this.comparator = new PerceptualComparator();
    this.db = db;
  }

  async verify(contentPath, contentType, metadata = null) {
    try {
      // Rechercher des entrées similaires dans les archives
      const query = {};
      if (metadata) {
        if (metadata.date) query.date = metadata.date;
        if (metadata.location) query.location = metadata.location;
        if (metadata.tags) query.tags = metadata.tags;
      }

      const similarEntries = await this.archiveManager.searchSimilar(query, contentType);

      // Comparer avec les entrées similaires
      const matchScores = [];
      for (const entry of similarEntries.slice(0, 10)) {
        const archiveEntry = await ArchiveEntry.findByPk(parseInt(entry.id));
        
        if (archiveEntry && archiveEntry.filePath) {
          const similarity = await this.comparator.compare(
            contentPath,
            archiveEntry.filePath,
            contentType
          );
          matchScores.push({
            entryId: entry.id,
            similarity: similarity.score,
            details: similarity
          });
        }
      }

      // Calculer le score de correspondance historique
      let historicalMatchScore = 0.0;
      if (matchScores.length > 0) {
        const bestMatch = matchScores.reduce((best, current) => 
          current.similarity > best.similarity ? current : best
        );
        historicalMatchScore = bestMatch.similarity;
      }

      // Vérifier la cohérence de la chronologie
      const timelineConsistency = this._checkTimelineConsistency(metadata, similarEntries);

      return {
        historicalMatchScore: historicalMatchScore,
        similarEntries: matchScores.slice(0, 5),
        timelineConsistency: timelineConsistency,
        totalMatches: similarEntries.length
      };
    } catch (error) {
      return {
        historicalMatchScore: 0.0,
        similarEntries: [],
        timelineConsistency: { score: 0.0, error: error.message },
        totalMatches: 0
      };
    }
  }

  _checkTimelineConsistency(metadata, similarEntries) {
    if (!metadata || !metadata.date) {
      return { score: 0.5, inconsistencies: ['Date non fournie'] };
    }

    try {
      const contentDate = new Date(metadata.date);
      const inconsistencies = [];
      let score = 1.0;

      // Vérifier si la date est cohérente avec les entrées similaires
      for (const entry of similarEntries.slice(0, 5)) {
        const entryDateStr = entry.source.historical_date;
        if (entryDateStr) {
          try {
            const entryDate = new Date(entryDateStr);
            const dateDiff = Math.abs((contentDate - entryDate) / (1000 * 60 * 60 * 24)); // Différence en jours

            if (dateDiff > 3650) { // 10 ans
              inconsistencies.push(
                `Date très différente de l'entrée d'archive (différence: ${Math.round(dateDiff)} jours)`
              );
              score -= 0.1;
            }
          } catch (error) {
            // Ignorer
          }
        }
      }

      return {
        score: Math.max(0.0, score),
        inconsistencies: inconsistencies
      };
    } catch (error) {
      return {
        score: 0.5,
        inconsistencies: [`Erreur lors de la vérification: ${error.message}`]
      };
    }
  }
}

module.exports = HistoricalVerifier;

