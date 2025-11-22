import exifParser from 'exif-parser';
import { readFileSync } from 'fs';
import logger from '../config/logger.js';

/**
 * Extrait les métadonnées EXIF d'une image
 */
export function extractImageMetadata(imagePath) {
  try {
    const buffer = readFileSync(imagePath);
    const parser = exifParser.create(buffer);
    const result = parser.parse();
    
    if (!result || !result.tags) {
      logger.info('Aucune métadonnée EXIF trouvée dans l\'image');
      return {
        hasMetadata: false,
        metadata: null,
        inconsistencies: [],
        credibilityReduction: 0.05 // Légère réduction si pas de métadonnées
      };
    }

    const tags = result.tags;
    const inconsistencies = [];
    let credibilityReduction = 0;

    // Vérification des incohérences
    const now = new Date();
    const imageDate = tags.DateTimeOriginal ? new Date(tags.DateTimeOriginal * 1000) : null;
    
    // Date dans le futur
    if (imageDate && imageDate > now) {
      inconsistencies.push({
        type: 'future_date',
        description: `La date de l'image (${imageDate.toISOString()}) est dans le futur`,
        severity: 'high'
      });
      credibilityReduction += 0.15;
    }

    // Date très ancienne (avant 1990)
    if (imageDate && imageDate < new Date('1990-01-01')) {
      inconsistencies.push({
        type: 'ancient_date',
        description: `La date de l'image (${imageDate.toISOString()}) semble suspecte`,
        severity: 'medium'
      });
      credibilityReduction += 0.1;
    }

    // Modèle d'appareil manquant
    if (!tags.Make || !tags.Model) {
      inconsistencies.push({
        type: 'missing_device_info',
        description: 'Informations sur l\'appareil photo manquantes',
        severity: 'low'
      });
      credibilityReduction += 0.05;
    }

    // Géolocalisation suspecte (coordonnées 0,0)
    if (tags.GPSLatitude === 0 && tags.GPSLongitude === 0) {
      inconsistencies.push({
        type: 'suspicious_gps',
        description: 'Géolocalisation à (0,0) - possiblement supprimée ou falsifiée',
        severity: 'medium'
      });
      credibilityReduction += 0.1;
    }

    // Résolution suspecte
    if (tags.ImageWidth && tags.ImageHeight) {
      const aspectRatio = tags.ImageWidth / tags.ImageHeight;
      if (aspectRatio < 0.5 || aspectRatio > 2.5) {
        inconsistencies.push({
          type: 'unusual_aspect_ratio',
          description: `Ratio d'aspect inhabituel: ${aspectRatio.toFixed(2)}`,
          severity: 'low'
        });
      }
    }

    return {
      hasMetadata: true,
      metadata: {
        make: tags.Make || null,
        model: tags.Model || null,
        dateTime: imageDate ? imageDate.toISOString() : null,
        gps: tags.GPSLatitude && tags.GPSLongitude ? {
          latitude: tags.GPSLatitude,
          longitude: tags.GPSLongitude
        } : null,
        software: tags.Software || null,
        orientation: tags.Orientation || null,
        width: tags.ImageWidth || null,
        height: tags.ImageHeight || null
      },
      inconsistencies,
      credibilityReduction: Math.min(credibilityReduction, 0.3) // Max 30% de réduction
    };
  } catch (error) {
    logger.warn('Erreur lors de l\'extraction des métadonnées EXIF:', error.message);
    return {
      hasMetadata: false,
      metadata: null,
      inconsistencies: [],
      credibilityReduction: 0.05
    };
  }
}

/**
 * Extrait les métadonnées d'une vidéo (via ffprobe)
 */
export async function extractVideoMetadata(videoPath) {
  // Cette fonction nécessiterait ffprobe pour extraire les métadonnées vidéo
  // Pour simplifier, on retourne une structure de base
  logger.info('Extraction des métadonnées vidéo (fonctionnalité de base)');
  return {
    hasMetadata: false,
    metadata: null,
    inconsistencies: [],
    credibilityReduction: 0.05
  };
}

