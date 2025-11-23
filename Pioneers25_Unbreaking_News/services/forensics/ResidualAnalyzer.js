/**
 * Analyseur de résidus pour détecter les manipulations d'images
 */
const sharp = require('sharp');

class ResidualAnalyzer {
  async analyze(imagePath) {
    try {
      const image = sharp(imagePath);
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

      // Convertir en niveaux de gris
      const grayData = this._toGrayscale(data, info.width, info.height);

      // Analyser les résidus
      const noisePattern = this._analyzeNoisePattern(grayData, info.width, info.height);
      const compressionArtifacts = this._analyzeCompressionArtifacts(grayData, info.width, info.height);
      const statisticalAnomalies = this._detectStatisticalAnomalies(grayData);

      // Score combiné
      const score = this._calculateManipulationScore(noisePattern, compressionArtifacts, statisticalAnomalies);

      return {
        score: score,
        noisePatternScore: noisePattern,
        compressionArtifacts: compressionArtifacts,
        statisticalAnomalies: statisticalAnomalies
      };
    } catch (error) {
      return {
        score: 0.5,
        noisePatternScore: 0.0,
        compressionArtifacts: 0.0,
        statisticalAnomalies: 0.0,
        error: error.message
      };
    }
  }

  _toGrayscale(imageData, width, height) {
    const grayData = [];
    for (let i = 0; i < imageData.length; i += 3) {
      grayData.push(imageData[i]); // Approximation avec canal rouge
    }
    return grayData;
  }

  _analyzeNoisePattern(grayData, width, height) {
    // Filtre passe-haut pour extraire le bruit
    const noiseValues = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const noise = Math.abs(
          8 * grayData[idx] -
          grayData[idx - 1] - grayData[idx + 1] -
          grayData[(y - 1) * width + x] - grayData[(y + 1) * width + x] -
          grayData[(y - 1) * width + x - 1] - grayData[(y - 1) * width + x + 1] -
          grayData[(y + 1) * width + x - 1] - grayData[(y + 1) * width + x + 1]
        );
        noiseValues.push(noise);
      }
    }

    const variance = this._calculateVariance(noiseValues);
    
    if (variance > 500) return 0.7;
    if (variance > 300) return 0.4;
    return 0.1;
  }

  _analyzeCompressionArtifacts(grayData, width, height) {
    const blockSize = 8;
    const artifactsScores = [];

    for (let i = 0; i < height - blockSize; i += blockSize) {
      for (let j = 0; j < width - blockSize; j += blockSize) {
        // Analyser chaque bloc 8x8
        let highFreqEnergy = 0;
        for (let y = 0; y < blockSize; y++) {
          for (let x = 0; x < blockSize; x++) {
            const idx = (i + y) * width + (j + x);
            if (x >= 4 || y >= 4) { // Hautes fréquences
              highFreqEnergy += Math.abs(grayData[idx]);
            }
          }
        }
        artifactsScores.push(highFreqEnergy);
      }
    }

    if (artifactsScores.length === 0) return 0.0;

    const variance = this._calculateVariance(artifactsScores);
    if (variance > 10000) return 0.8;
    if (variance > 5000) return 0.5;
    return 0.2;
  }

  _detectStatisticalAnomalies(grayData) {
    // Histogramme
    const histogram = new Array(256).fill(0);
    grayData.forEach(val => {
      histogram[Math.min(255, Math.max(0, Math.round(val)))]++;
    });

    // Normaliser
    const total = grayData.length;
    const normalizedHist = histogram.map(count => count / total);

    // Calculer l'entropie
    let entropy = 0;
    normalizedHist.forEach(prob => {
      if (prob > 0) {
        entropy -= prob * Math.log2(prob);
      }
    });

    // Les images manipulées peuvent avoir une entropie anormale
    if (entropy < 5.0 || entropy > 8.5) return 0.6;
    if (entropy < 6.0 || entropy > 8.0) return 0.3;
    return 0.1;
  }

  _calculateVariance(data) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return variance;
  }

  _calculateManipulationScore(noise, artifacts, anomalies) {
    // Moyenne pondérée
    const score = (noise * 0.4 + artifacts * 0.4 + anomalies * 0.2);
    return Math.min(1.0, score);
  }
}

module.exports = ResidualAnalyzer;

