/**
 * Comparaison perceptuelle et détection de variantes
 */
const sharp = require('sharp');
const fs = require('fs').promises;

class PerceptualComparator {
  async compare(file1Path, file2Path, contentType) {
    if (contentType === 'image') {
      return await this._compareImages(file1Path, file2Path);
    } else if (contentType === 'text') {
      return await this._compareTexts(file1Path, file2Path);
    } else if (contentType === 'audio') {
      return await this._compareAudio(file1Path, file2Path);
    } else {
      return { score: 0.0, error: 'Type de contenu non supporté' };
    }
  }

  async _compareImages(img1Path, img2Path) {
    try {
      const img1 = sharp(img1Path);
      const img2 = sharp(img2Path);

      const metadata1 = await img1.metadata();
      const metadata2 = await img2.metadata();

      // Redimensionner si nécessaire
      const width = Math.min(metadata1.width, metadata2.width);
      const height = Math.min(metadata1.height, metadata2.height);

      const img1Buffer = await img1.resize(width, height).greyscale().raw().toBuffer();
      const img2Buffer = await img2.resize(width, height).greyscale().raw().toBuffer();

      // SSIM simplifié (Structural Similarity Index)
      const ssimScore = this._calculateSSIM(img1Buffer, img2Buffer, width, height);

      // Différence absolue
      const diff = this._calculateAbsoluteDifference(img1Buffer, img2Buffer);
      const meanDiff = diff / (width * height * 255);
      const similarityScore = 1.0 - meanDiff;

      // Score combiné
      const combinedScore = (ssimScore * 0.7 + similarityScore * 0.3);

      // Détection de variantes et altérations
      const variantScore = this._detectVariants(img1Buffer, img2Buffer, width, height);
      const alterationScore = this._detectAlterations(img1Buffer, img2Buffer, width, height);

      return {
        score: combinedScore,
        ssimScore: ssimScore,
        similarityScore: similarityScore,
        variantScore: variantScore,
        alterationScore: alterationScore
      };
    } catch (error) {
      return { score: 0.0, error: error.message };
    }
  }

  async _compareTexts(text1Path, text2Path) {
    try {
      const text1 = await fs.readFile(text1Path, 'utf-8');
      const text2 = await fs.readFile(text2Path, 'utf-8');

      // Similarité de séquence (simplifié)
      const similarity = this._sequenceSimilarity(text1, text2);

      // Détection de variantes et altérations
      const variantScore = this._detectTextVariants(text1, text2);
      const alterationScore = this._detectTextAlterations(text1, text2);

      return {
        score: similarity,
        variantScore: variantScore,
        alterationScore: alterationScore
      };
    } catch (error) {
      return { score: 0.0, error: error.message };
    }
  }

  async _compareAudio(audio1Path, audio2Path) {
    // Placeholder: Utiliser librosa-node ou similar pour comparer les spectrogrammes
    return {
      score: 0.5,
      variantScore: 0.0,
      alterationScore: 0.0,
      note: 'Comparaison audio non implémentée'
    };
  }

  _calculateSSIM(img1, img2, width, height) {
    // SSIM simplifié
    let sum = 0;
    const count = width * height;

    for (let i = 0; i < count; i++) {
      const diff = Math.abs(img1[i] - img2[i]);
      sum += 1 - (diff / 255);
    }

    return sum / count;
  }

  _calculateAbsoluteDifference(img1, img2) {
    let diff = 0;
    for (let i = 0; i < img1.length; i++) {
      diff += Math.abs(img1[i] - img2[i]);
    }
    return diff;
  }

  _detectVariants(img1, img2, width, height) {
    const differences = [];
    for (let i = 0; i < img1.length; i++) {
      differences.push(Math.abs(img1[i] - img2[i]));
    }

    const variance = this._calculateVariance(differences);
    
    if (variance < 100) return 0.1;
    if (variance < 500) return 0.5;
    return 0.9;
  }

  _detectAlterations(img1, img2, width, height) {
    // Seuillage pour identifier les zones d'altération
    const threshold = 30;
    let alteredPixels = 0;

    for (let i = 0; i < img1.length; i++) {
      if (Math.abs(img1[i] - img2[i]) > threshold) {
        alteredPixels++;
      }
    }

    const alterationRatio = alteredPixels / img1.length;

    if (alterationRatio > 0.1) return 0.9;
    if (alterationRatio > 0.05) return 0.6;
    if (alterationRatio > 0.01) return 0.3;
    return 0.1;
  }

  _sequenceSimilarity(text1, text2) {
    // Algorithme de similarité de séquence simplifié
    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;

    if (longer.length === 0) return 1.0;

    const editDistance = this._levenshteinDistance(longer, shorter);
    return 1 - (editDistance / longer.length);
  }

  _levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  _detectTextVariants(text1, text2) {
    // Compter les différences mineures (variantes)
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    let differences = 0;

    const maxLen = Math.max(words1.length, words2.length);
    for (let i = 0; i < maxLen; i++) {
      if (words1[i] !== words2[i]) {
        differences++;
      }
    }

    const variantRatio = differences / maxLen;
    return Math.min(1.0, variantRatio * 2);
  }

  _detectTextAlterations(text1, text2) {
    const similarity = this._sequenceSimilarity(text1, text2);

    if (similarity < 0.5) return 0.9;
    if (similarity < 0.7) return 0.6;
    if (similarity < 0.9) return 0.3;
    return 0.1;
  }

  _calculateVariance(data) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return variance;
  }
}

module.exports = PerceptualComparator;

