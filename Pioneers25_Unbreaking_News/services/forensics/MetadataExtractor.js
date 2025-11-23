/**
 * Extracteur de métadonnées pour l'analyse forensique
 */
const exifParser = require('exif-parser');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class MetadataExtractor {
  async extract(filePath) {
    try {
      const fileExt = path.extname(filePath).toLowerCase();
      
      if (['.jpg', '.jpeg', '.png', '.tiff', '.tif'].includes(fileExt)) {
        return await this._extractImageMetadata(filePath);
      } else if (['.mp3', '.wav', '.flac'].includes(fileExt)) {
        return await this._extractAudioMetadata(filePath);
      } else {
        return await this._extractGenericMetadata(filePath);
      }
    } catch (error) {
      return {
        error: error.message,
        extracted: false
      };
    }
  }

  async _extractImageMetadata(filePath) {
    const metadata = {
      extracted: true,
      fileType: 'image',
      exifData: {},
      pilExif: {},
      creationDate: null,
      modificationDate: null,
      dimensions: null,
      formatInfo: {},
      deviceInfo: {}
    };

    try {
      // Extraction avec sharp
      const image = sharp(filePath);
      const imageMetadata = await image.metadata();
      
      metadata.dimensions = `${imageMetadata.width}x${imageMetadata.height}`;
      metadata.formatInfo = {
        format: imageMetadata.format,
        hasAlpha: imageMetadata.hasAlpha,
        space: imageMetadata.space
      };

      // Extraction EXIF
      const fileBuffer = await fs.readFile(filePath);
      const parser = exifParser.create(fileBuffer);
      const exifData = parser.parse();

      if (exifData && exifData.tags) {
        metadata.exifData = exifData.tags;
        
        // Extraire des dates importantes
        if (exifData.tags.DateTime) {
          metadata.creationDate = new Date(exifData.tags.DateTime * 1000).toISOString();
        }
        if (exifData.tags.DateTimeOriginal) {
          metadata.creationDate = new Date(exifData.tags.DateTimeOriginal * 1000).toISOString();
        }

        // Informations sur l'appareil
        if (exifData.tags.Make) {
          metadata.deviceInfo.make = exifData.tags.Make;
        }
        if (exifData.tags.Model) {
          metadata.deviceInfo.model = exifData.tags.Model;
        }
        if (exifData.tags.Software) {
          metadata.software = exifData.tags.Software;
        }
      }
    } catch (error) {
      metadata.extractionError = error.message;
    }

    // Date de modification du fichier
    try {
      const stats = await fs.stat(filePath);
      metadata.modificationDate = stats.mtime.toISOString();
    } catch (error) {
      // Ignorer
    }

    return metadata;
  }

  async _extractAudioMetadata(filePath) {
    const metadata = {
      extracted: true,
      fileType: 'audio',
      formatInfo: {}
    };

    try {
      const stats = await fs.stat(filePath);
      metadata.modificationDate = stats.mtime.toISOString();
    } catch (error) {
      // Ignorer
    }

    return metadata;
  }

  async _extractGenericMetadata(filePath) {
    const metadata = {
      extracted: true,
      fileType: 'generic',
      fileName: path.basename(filePath)
    };

    try {
      const stats = await fs.stat(filePath);
      metadata.fileSize = stats.size;
      metadata.modificationDate = stats.mtime.toISOString();
    } catch (error) {
      // Ignorer
    }

    return metadata;
  }

  checkConsistency(metadata) {
    const inconsistencies = [];
    let score = 1.0;

    // Vérifier les dates
    if (metadata.creationDate && metadata.modificationDate) {
      try {
        const creation = new Date(metadata.creationDate);
        const modification = new Date(metadata.modificationDate);
        
        if (creation > modification) {
          inconsistencies.push('Date de création postérieure à la date de modification');
          score -= 0.3;
        }
      } catch (error) {
        // Ignorer
      }
    }

    // Vérifier la présence d'informations suspectes
    if (metadata.exifData && Object.keys(metadata.exifData).length === 0) {
      inconsistencies.push('Aucune métadonnée EXIF trouvée');
      score -= 0.2;
    }

    return {
      score: Math.max(0.0, score),
      inconsistencies: inconsistencies
    };
  }
}

module.exports = MetadataExtractor;

