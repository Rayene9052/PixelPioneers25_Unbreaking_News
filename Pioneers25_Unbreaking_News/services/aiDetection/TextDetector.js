/**
 * Détecteur de contenus générés par IA pour les textes
 */
class TextAIDetector {
  constructor() {
    this.modelPath = process.env.TEXT_DETECTION_MODEL || './models/text_detection_model';
  }

  detect(text) {
    try {
      if (!text || text.trim().length === 0) {
        return {
          score: 0.5,
          confidence: 0.0,
          modelUsed: 'empty',
          error: 'Texte vide'
        };
      }

      const features = this._extractFeatures(text);
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

  _extractFeatures(text) {
    const words = text.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    const uniqueWords = new Set(words).size;
    const lexicalDiversity = uniqueWords / wordCount;

    // Répétitions
    let repetitions = 0;
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i] === words[i + 1]) {
        repetitions++;
      }
    }
    const repetitionRate = repetitions / wordCount;

    // Patterns typiques des IA
    const aiPatterns = [
      /\b(certainly|indeed|furthermore|moreover|additionally)\b/gi,
      /\b(it is important to note|it should be noted|it is worth mentioning)\b/gi,
      /\b(in conclusion|to summarize|in summary)\b/gi
    ];
    let aiPatternCount = 0;
    aiPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) aiPatternCount += matches.length;
    });

    // Longueur moyenne des phrases
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;

    // Variance de longueur des phrases
    const mean = avgSentenceLength;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / sentenceLengths.length;

    return {
      length: text.length,
      wordCount: wordCount,
      lexicalDiversity: lexicalDiversity,
      repetitionRate: repetitionRate,
      aiPatternCount: aiPatternCount,
      avgSentenceLength: avgSentenceLength,
      sentenceVariance: variance
    };
  }

  _calculateAIProbability(features) {
    let score = 0.5; // Base neutre

    // Lexical diversity faible = possiblement IA
    if (features.lexicalDiversity < 0.5) {
      score += 0.1;
    }

    // Répétitions élevées = possiblement IA
    if (features.repetitionRate > 0.05) {
      score += 0.1;
    }

    // Patterns typiques des IA
    if (features.aiPatternCount > 3) {
      score += 0.15;
    }

    // Phrases trop uniformes en longueur = possiblement IA
    if (features.sentenceVariance < 10) {
      score += 0.1;
    }

    return Math.max(0.0, Math.min(1.0, score));
  }
}

module.exports = TextAIDetector;

