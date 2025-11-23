import exifParser from 'exif-parser';
import { readFileSync } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
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
  try {
    logger.info('Extraction des métadonnées vidéo...');
    
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          logger.warn('Erreur lors de l\'extraction des métadonnées vidéo:', err.message);
          resolve({
            hasMetadata: false,
            metadata: null,
            inconsistencies: [],
            credibilityReduction: 0.05
          });
          return;
        }

        const inconsistencies = [];
        let credibilityReduction = 0;

        // Vérification des métadonnées
        if (metadata.format) {
          const format = metadata.format;
          
          // Vérifier la durée (vidéo trop courte ou trop longue = suspect)
          if (format.duration) {
            if (format.duration < 1) {
              inconsistencies.push({
                type: 'very_short_duration',
                description: `Durée très courte: ${format.duration.toFixed(2)}s`,
                severity: 'low'
              });
            } else if (format.duration > 3600) {
              inconsistencies.push({
                type: 'very_long_duration',
                description: `Durée très longue: ${(format.duration / 60).toFixed(2)}min`,
                severity: 'low'
              });
            }
          }

          // Vérifier le bitrate (anormalement bas ou haut)
          if (format.bit_rate) {
            const bitrateMbps = format.bit_rate / 1000000;
            if (bitrateMbps < 0.5) {
              inconsistencies.push({
                type: 'low_bitrate',
                description: `Bitrate très bas: ${bitrateMbps.toFixed(2)} Mbps`,
                severity: 'medium'
              });
              credibilityReduction += 0.05;
            }
          }

          // Vérifier les tags (métadonnées)
          if (format.tags) {
            const tags = format.tags;
            
            // Date de création suspecte
            if (tags.creation_time) {
              const creationDate = new Date(tags.creation_time);
              const now = new Date();
              
              if (creationDate > now) {
                inconsistencies.push({
                  type: 'future_date',
                  description: `Date de création dans le futur: ${creationDate.toISOString()}`,
                  severity: 'high'
                });
                credibilityReduction += 0.15;
              }
            }

            // Logiciel de création suspect
            if (tags.encoder) {
              const encoder = tags.encoder.toLowerCase();
              if (encoder.includes('deepfake') || encoder.includes('fake')) {
                inconsistencies.push({
                  type: 'suspicious_encoder',
                  description: `Logiciel suspect détecté: ${tags.encoder}`,
                  severity: 'high'
                });
                credibilityReduction += 0.2;
              }
            }
          }
        }

        // Vérifier les streams vidéo
        if (metadata.streams) {
          const videoStreams = metadata.streams.filter(s => s.codec_type === 'video');
          
          if (videoStreams.length === 0) {
            inconsistencies.push({
              type: 'no_video_stream',
              description: 'Aucun stream vidéo détecté',
              severity: 'high'
            });
            credibilityReduction += 0.15;
          } else {
            const videoStream = videoStreams[0];
            
            // Vérifier la résolution
            if (videoStream.width && videoStream.height) {
              const resolution = videoStream.width * videoStream.height;
              if (resolution < 640 * 480) {
                inconsistencies.push({
                  type: 'low_resolution',
                  description: `Résolution très basse: ${videoStream.width}x${videoStream.height}`,
                  severity: 'medium'
                });
                credibilityReduction += 0.1;
              }
            }

            // Vérifier le codec
            if (videoStream.codec_name) {
              const suspiciousCodecs = ['h264', 'hevc', 'vp9'];
              // Les codecs standards sont OK, mais on note le codec utilisé
              logger.debug(`Codec vidéo: ${videoStream.codec_name}`);
            }
          }
        }

        resolve({
          hasMetadata: true,
          metadata: {
            format: metadata.format ? {
              duration: metadata.format.duration,
              bitrate: metadata.format.bit_rate,
              size: metadata.format.size,
              tags: metadata.format.tags || {}
            } : null,
            streams: metadata.streams ? metadata.streams.length : 0,
            videoStreams: metadata.streams ? metadata.streams.filter(s => s.codec_type === 'video').length : 0
          },
          inconsistencies,
          credibilityReduction: Math.min(credibilityReduction, 0.3)
        });
      });
    });
  } catch (error) {
    logger.error('Erreur lors de l\'extraction des métadonnées vidéo:', error);
    return {
      hasMetadata: false,
      metadata: null,
      inconsistencies: [],
      credibilityReduction: 0.05
    };
  }
}

