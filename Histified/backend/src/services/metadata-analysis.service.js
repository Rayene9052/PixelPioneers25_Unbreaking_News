const ExifReader = require('exifreader');

class MetadataAnalysisService {
  async extractMetadata(fileBuffer) {
    try {
      const tags = ExifReader.load(fileBuffer, { expanded: true });
      return tags;
    } catch (error) {
      throw new Error('Failed to extract metadata: ' + error.message);
    }
  }

  analyzeForManipulation(metadata) {
    const analysis = {
      isOriginal: true,
      confidence: 100,
      warnings: []
    };

    // Check for editing software
    if (metadata.exif?.Software?.description) {
      const software = metadata.exif.Software.description;
      const editingTools = ['Photoshop', 'GIMP', 'Paint.NET', 'Lightroom'];
      
      if (editingTools.some(tool => software.includes(tool))) {
        analysis.warnings.push(`Image edited with ${software}`);
        analysis.confidence -= 40;
        analysis.isOriginal = false;
      }
    }

    // Check for missing basic metadata
    if (!metadata.exif?.Make && !metadata.exif?.Model) {
      analysis.warnings.push('Camera information missing');
      analysis.confidence -= 20;
    }

    // Check timestamp consistency
    if (metadata.exif?.DateTimeOriginal && metadata.exif?.ModifyDate) {
      const original = new Date(metadata.exif.DateTimeOriginal.description);
      const modified = new Date(metadata.exif.ModifyDate.description);
      const daysDiff = Math.abs(modified - original) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 1) {
        analysis.warnings.push(`File modified ${Math.floor(daysDiff)} days after capture`);
        analysis.confidence -= 15;
      }
    }

    analysis.isOriginal = analysis.confidence > 50;
    return analysis;
  }
}

module.exports = MetadataAnalysisService;
