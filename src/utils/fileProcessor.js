import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs, createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { PDFDocument } from 'pdf-lib';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extrait des frames clés d'une vidéo (1 frame par seconde)
 */
export async function extractVideoFrames(videoPath, outputDir) {
  const frames = [];
  const frameInterval = 1; // 1 seconde
  
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        logger.error('Erreur lors de la lecture de la vidéo:', err);
        return reject(err);
      }

      const duration = metadata.format.duration;
      const frameCount = Math.floor(duration / frameInterval);
      
      logger.info(`Extraction de ${frameCount} frames de la vidéo...`);

      let extractedCount = 0;
      const framePromises = [];

      for (let i = 0; i < frameCount; i++) {
        const timestamp = i * frameInterval;
        const framePath = path.join(outputDir, `frame_${i.toString().padStart(4, '0')}.jpg`);
        
        const promise = new Promise((frameResolve, frameReject) => {
          ffmpeg(videoPath)
            .screenshots({
              timestamps: [timestamp],
              filename: `frame_${i.toString().padStart(4, '0')}.jpg`,
              folder: outputDir,
              size: '1920x1080'
            })
            .on('end', () => {
              extractedCount++;
              frames.push(framePath);
              frameResolve(framePath);
            })
            .on('error', (err) => {
              logger.warn(`Erreur extraction frame à ${timestamp}s:`, err.message);
              frameReject(err);
            });
        });
        
        framePromises.push(promise);
      }

      Promise.allSettled(framePromises)
        .then(() => {
          logger.info(`${extractedCount} frames extraites avec succès`);
          resolve(frames);
        })
        .catch(reject);
    });
  });
}

/**
 * Extrait les images d'un PDF
 */
export async function extractPDFImages(pdfBuffer) {
  try {
    logger.info('Extraction des images du PDF...');
    const images = [];
    
    // Charger le document PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    // Parcourir toutes les pages pour extraire les images
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // Note: pdf-lib peut extraire les images mais nécessite une manipulation plus complexe
      // Pour une extraction complète, on utiliserait pdfjs-dist ou pdf2pic
      // Ici, on retourne une structure de base indiquant que des images sont présentes
      
      // Vérifier si la page contient des images (via les opérateurs de contenu)
      // Cette vérification est simplifiée - une implémentation complète nécessiterait
      // l'analyse du contenu de la page
    }
    
    // Pour l'instant, on indique qu'on a détecté un PDF avec potentiellement des images
    // Une implémentation complète nécessiterait pdfjs-dist ou une autre bibliothèque
    logger.info(`PDF analysé: ${pages.length} page(s) détectée(s)`);
    
    return images; // Retourne un tableau vide pour l'instant
  } catch (error) {
    logger.warn('Erreur lors de l\'extraction d\'images du PDF:', error.message);
    // Retourner un tableau vide en cas d'erreur
    return [];
  }
}

/**
 * Normalise une image (redimensionnement, format)
 */
export async function normalizeImage(imagePath, outputPath) {
  try {
    await sharp(imagePath)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    logger.error('Erreur lors de la normalisation de l\'image:', error);
    throw error;
  }
}

/**
 * Calcule le hash SHA-256 d'un fichier
 */
export async function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Nettoie les fichiers temporaires
 */
export async function cleanupTempFiles(filePaths) {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
      logger.debug(`Fichier temporaire supprimé: ${filePath}`);
    } catch (error) {
      logger.warn(`Impossible de supprimer ${filePath}:`, error.message);
    }
  }
}

