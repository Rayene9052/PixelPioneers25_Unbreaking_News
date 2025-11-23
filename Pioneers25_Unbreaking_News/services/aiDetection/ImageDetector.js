/**
 * Détecteur de contenus générés par IA pour les images
 */
const sharp = require('sharp');
const { createHash } = require('crypto');

class ImageAIDetector {
  constructor() {
    this.modelPath = process.env.AI_DETECTION_MODEL || './models/ai_detection_model.h5';
  }

  async detect(imagePath) {
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

      // Extraire les caractéristiques
      const features = this._extractFeatures(data, info.width, info.height);
      
      // Calculer la probabilité IA
      const score = this._calculateAIProbability(features);

      return {
        score: score,
        confidence: Math.min(score * 1.2, 1.0),
        modelUsed: 'heuristic_v1',
        features: features
      };
    } catch (error) {
      return {
        score: 0.5,
        confidence: 0.0,
        modelUsed: 'error',
        error: error.message
      };
    }
  }

  _extractFeatures(imageData, width, height) {
    // Convertir en niveaux de gris si nécessaire
    const grayData = this._toGrayscale(imageData, width, height);
    
    // Calculer la variance
    const variance = this._calculateVariance(grayData);
    
    // Analyser les gradients
    const gradients = this._calculateGradients(grayData, width, height);
    const gradientMean = gradients.reduce((a, b) => a + b, 0) / gradients.length;
    
    // Analyser la texture
    const textureUniformity = this._calculateTextureUniformity(grayData, width, height);
    
    return {
      variance: variance,
      gradientMean: gradientMean,
      textureUniformity: textureUniformity
    };
  }

  _toGrayscale(imageData, width, height) {
    // Simplifié: prendre le canal rouge comme approximation
    const grayData = [];
    for (let i = 0; i < imageData.length; i += 3) {
      grayData.push(imageData[i]);
    }
    return grayData;
  }

  _calculateVariance(data) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return variance;
  }

  _calculateGradients(grayData, width, height) {
    const gradients = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const gx = Math.abs(grayData[idx + 1] - grayData[idx - 1]);
        const gy = Math.abs(grayData[(y + 1) * width + x] - grayData[(y - 1) * width + x]);
        gradients.push(Math.sqrt(gx * gx + gy * gy));
      }
    }
    return gradients;
  }

  _calculateTextureUniformity(grayData, width, height) {
    // Filtre de texture simplifié (Laplacien)
    let textureSum = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const laplacian = Math.abs(
          8 * grayData[idx] -
          grayData[idx - 1] - grayData[idx + 1] -
          grayData[(y - 1) * width + x] - grayData[(y + 1) * width + x] -
          grayData[(y - 1) * width + x - 1] - grayData[(y - 1) * width + x + 1] -
          grayData[(y + 1) * width + x - 1] - grayData[(y + 1) * width + x + 1]
        );
        textureSum += laplacian;
      }
    }
    return textureSum / ((width - 2) * (height - 2));
  }

  _calculateAIProbability(features) {
    let score = 0.5; // Base neutre

    // Ajustement basé sur la variance
    if (features.variance < 1000) {
      score += 0.15;
    } else if (features.variance > 5000) {
      score -= 0.15;
    }

    // Ajustement basé sur l'uniformité de texture
    if (features.textureUniformity < 20) {
      score += 0.1;
    }

    // Ajustement basé sur les gradients
    if (features.gradientMean < 30) {
      score += 0.1;
    }

    return Math.max(0.0, Math.min(1.0, score));
  }
}

module.exports = ImageAIDetector;

