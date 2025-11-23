/**
 * Analyseur Error Level Analysis (ELA) pour détecter les manipulations d'images
 */
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ELAAnalyzer {
  constructor(quality = 95) {
    this.quality = quality;
  }

  async analyze(imagePath) {
    try {
      // Charger l'image originale
      const originalImage = sharp(imagePath);
      const originalBuffer = await originalImage.toBuffer();
      const metadata = await originalImage.metadata();

      // Sauvegarder temporairement en JPEG
      const tempPath = path.join(process.env.UPLOAD_DIR || './uploads', `temp_${uuidv4()}.jpg`);
      await sharp(originalBuffer)
        .jpeg({ quality: this.quality })
        .toFile(tempPath);

      // Recharger l'image recompressée
      const recompressedBuffer = await sharp(tempPath).toBuffer();

      // Nettoyer le fichier temporaire
      await fs.unlink(tempPath).catch(() => {});

      // Calculer la différence (ELA)
      const originalData = await originalImage.raw().toBuffer();
      const recompressedData = await sharp(recompressedBuffer).raw().toBuffer();

      const elaResult = this._calculateDifference(originalData, recompressedData);

      // Calculer les statistiques
      const maxError = Math.max(...elaResult);
      const meanError = elaResult.reduce((a, b) => a + b, 0) / elaResult.length;
      const variance = this._calculateVariance(elaResult, meanError);

      // Score de manipulation
      const score = this._calculateManipulationScore(maxError, meanError, variance);

      return {
        score: score,
        maxError: maxError,
        meanError: meanError,
        variance: variance
      };
    } catch (error) {
      return {
        score: 0.5,
        maxError: 0.0,
        meanError: 0.0,
        variance: 0.0,
        error: error.message
      };
    }
  }

  _calculateDifference(originalData, recompressedData) {
    const differences = [];
    const minLength = Math.min(originalData.length, recompressedData.length);
    
    for (let i = 0; i < minLength; i++) {
      differences.push(Math.abs(originalData[i] - recompressedData[i]));
    }
    
    return differences;
  }

  _calculateVariance(data, mean) {
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return variance;
  }

  _calculateManipulationScore(maxError, meanError, variance) {
    let score = 0.0;

    // Erreur maximale élevée = possible manipulation
    if (maxError > 50) {
      score += 0.3;
    } else if (maxError > 30) {
      score += 0.15;
    }

    // Variance élevée = zones suspectes
    if (variance > 1000) {
      score += 0.3;
    } else if (variance > 500) {
      score += 0.15;
    }

    // Erreur moyenne élevée = possible manipulation globale
    if (meanError > 10) {
      score += 0.2;
    } else if (meanError > 5) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }
}

module.exports = ELAAnalyzer;

