class ELADetectionService {
  async performAnalysis(fileBuffer) {
    return {
      isOriginal: true,
      confidence: 80,
      warnings: []
    };
  }
}

module.exports = ELADetectionService;
