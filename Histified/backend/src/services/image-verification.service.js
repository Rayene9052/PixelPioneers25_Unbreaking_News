class ImageVerificationService {
  constructor(metadataService, visualContentService) {
    this.metadataService = metadataService;
    this.visualContentService = visualContentService;
  }

  async verifyImage(fileBuffer, filename) {
    // Run metadata analysis (your existing service)
    const metadata = await this.metadataService.extractMetadata(fileBuffer);
    const metadataAnalysis = this.metadataService.analyzeForManipulation(metadata);
    
    // Run visual content analysis (new advanced metrics)
    const visualAnalysis = await this.visualContentService.analyzeImage(fileBuffer);
    
    // Determine if metadata is available
    const hasMetadata = metadata.exif?.Make || metadata.exif?.DateTimeOriginal;
    
    // Calculate combined confidence
    const combinedConfidence = hasMetadata 
      ? Math.min(metadataAnalysis.confidence, visualAnalysis.overallAssessment.confidence)
      : visualAnalysis.overallAssessment.confidence;

    // Combine all warnings
    const allWarnings = [
      ...metadataAnalysis.warnings,
      ...visualAnalysis.overallAssessment.findings
    ];

    return {
      filename,
      summary: {
        isOriginal: metadataAnalysis.isOriginal && visualAnalysis.overallAssessment.verdict === 'AUTHENTIC',
        confidence: combinedConfidence,
        verdict: visualAnalysis.overallAssessment.verdict,
        reliability: hasMetadata ? 'HIGH' : 'MEDIUM'
      },
      metadataAnalysis: {
        available: hasMetadata,
        confidence: metadataAnalysis.confidence,
        isOriginal: metadataAnalysis.isOriginal,
        warnings: metadataAnalysis.warnings,
        extractedFields: {
          camera: metadata.exif?.Make?.description || 'Unknown',
          model: metadata.exif?.Model?.description || 'Unknown',
          software: metadata.exif?.Software?.description || 'None',
          dateTimeOriginal: metadata.exif?.DateTimeOriginal?.description || 'Unknown',
          modifyDate: metadata.exif?.ModifyDate?.description || 'Unknown'
        }
      },
      visualForensics: {
        suspicionScore: visualAnalysis.overallAssessment.suspicionScore,
        verdict: visualAnalysis.overallAssessment.verdict,
        confidence: visualAnalysis.overallAssessment.confidence,
        analyses: {
          lighting: visualAnalysis.lightingAnalysis,
          physicalCoherence: visualAnalysis.physicalCoherence,
          noisePatterns: visualAnalysis.noisePatterns,
          artifacts: visualAnalysis.artifactDetection,
          photographicProperties: visualAnalysis.photographicProperties
        }
      },
      allWarnings: allWarnings,
      recommendations: this.getRecommendations(metadataAnalysis, visualAnalysis, hasMetadata)
    };
  }

  getRecommendations(metadataAnalysis, visualAnalysis, hasMetadata) {
    const recommendations = [];

    if (!metadataAnalysis.isOriginal) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Metadata',
        issue: 'Editing software detected in metadata',
        action: 'Verify if editing was legitimate (e.g., color correction) or manipulation'
      });
    }

    if (visualAnalysis.overallAssessment.verdict === 'LIKELY_MANIPULATED') {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Visual Forensics',
        issue: 'Multiple visual inconsistencies detected',
        action: 'Perform reverse image search and manual inspection immediately'
      });
    }

    if (visualAnalysis.overallAssessment.verdict === 'SUSPICIOUS') {
      recommendations.push({
        priority: 'HIGH',
        category: 'Visual Forensics',
        issue: 'Some visual inconsistencies detected',
        action: 'Cross-reference with other sources and examine suspect regions'
      });
    }

    if (!hasMetadata) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Metadata',
        issue: 'No metadata available',
        action: 'Use reverse image search to find original source with metadata'
      });
    }

    if (visualAnalysis.lightingAnalysis && !visualAnalysis.lightingAnalysis.consistent) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Lighting',
        issue: 'Inconsistent lighting detected',
        action: 'Examine image for composite elements or multiple light sources'
      });
    }

    if (visualAnalysis.noisePatterns && !visualAnalysis.noisePatterns.consistent) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Noise',
        issue: 'Irregular noise distribution',
        action: 'Check for spliced regions from different cameras or sources'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'INFO',
        category: 'Result',
        issue: 'No major issues detected',
        action: 'Image appears authentic, but always verify context and source'
      });
    }

    return recommendations;
  }
}

module.exports = ImageVerificationService;
