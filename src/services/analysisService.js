import ForensicService from './forensicService.js';
import OSINTService from './osintService.js';
import NLPService from './nlpService.js';
import HederaService from './hederaService.js';
import SourceReliabilityService from './sourceReliabilityService.js';
import { extractImageMetadata, extractVideoMetadata } from '../utils/metadataExtractor.js';
import { calculateFileHash, extractVideoFrames, extractPDFImages } from '../utils/fileProcessor.js';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { promises as fs } from 'fs';
import path from 'path';
import logger from '../config/logger.js';

/**
 * Service central d'analyse qui orchestre toutes les analyses
 */
class AnalysisService {
  constructor(config) {
    this.forensicService = new ForensicService(config.hiveApiKey);
    this.osintService = new OSINTService(config.serpApiKey);
    this.nlpService = new NLPService(config.openaiApiKey);
    this.sourceReliabilityService = new SourceReliabilityService(config.openaiApiKey);
    this.hederaService = new HederaService(
      config.hederaAccountId,
      config.hederaPrivateKey,
      config.hederaNetwork
    );
  }

  /**
   * Analyse complète d'une image
   */
  async analyzeImage(imagePath) {
    logger.info('=== Démarrage de l\'analyse d\'image ===');
    
    const tempFiles = [];
    let analysisResult = {
      fileType: 'image',
      timestamp: new Date().toISOString(),
      hash: null,
      forensic: null,
      metadata: null,
      osint: null,
      sourceReliability: null,
      nlp: null,
      hedera: null,
      finalScore: 0,
      report: {}
    };

    try {
      // 1. Calcul du hash
      analysisResult.hash = await calculateFileHash(imagePath);
      logger.info(`Hash calculé: ${analysisResult.hash.substring(0, 16)}...`);

      // 2. Extraction des métadonnées EXIF
      analysisResult.metadata = extractImageMetadata(imagePath);
      logger.info('Métadonnées extraites');

      // 3. Analyse forensique
      analysisResult.forensic = await this.forensicService.analyzeImage(imagePath);
      logger.info('Analyse forensique terminée');

      // 4. Analyse OSINT (reverse image search)
      analysisResult.osint = await this.osintService.reverseImageSearch(imagePath);
      logger.info('Analyse OSINT terminée');

      // 4.5. Vérification de la fiabilité des sources trouvées
      if (analysisResult.osint.sources && analysisResult.osint.sources.length > 0) {
        analysisResult.sourceReliability = await this.sourceReliabilityService.verifySources(
          analysisResult.osint.sources
        );
        logger.info('Vérification de fiabilité des sources terminée');
        
        // Ajustement du score OSINT basé sur la fiabilité des sources
        const reliabilityScore = analysisResult.sourceReliability.averageReliabilityScore;
        const originalOSINTScore = analysisResult.osint.score;
        // Pondération: 60% score OSINT original, 40% fiabilité des sources
        analysisResult.osint.score = Math.round(originalOSINTScore * 0.6 + reliabilityScore * 0.4);
        analysisResult.osint.reliabilityAnalysis = analysisResult.sourceReliability;
        
        // Mise à jour des sources avec les informations de fiabilité
        if (analysisResult.sourceReliability.verifiedSources) {
          analysisResult.osint.sources = analysisResult.sourceReliability.verifiedSources.map(vs => ({
            ...vs,
            reliability: vs.reliability
          }));
        }
      } else {
        analysisResult.sourceReliability = {
          verifiedSources: [],
          averageReliabilityScore: 50,
          reliableCount: 0,
          suspiciousCount: 0,
          analysis: 'Aucune source à vérifier'
        };
      }

      // 5. Analyse NLP (si texte présent dans l'image via OCR)
      try {
        const { data: { text } } = await Tesseract.recognize(imagePath, 'fra+eng');
        if (text && text.trim().length > 50) {
          analysisResult.nlp = await this.nlpService.analyzeText(text);
          logger.info('Analyse NLP terminée');
        } else {
          analysisResult.nlp = {
            score: 50,
            description: 'Pas de texte suffisant pour l\'analyse NLP',
            confidence: 0.3
          };
        }
      } catch (error) {
        logger.warn('Erreur OCR:', error.message);
        analysisResult.nlp = {
          score: 50,
          description: 'Erreur lors de l\'extraction OCR',
          confidence: 0
        };
      }

      // 6. Enregistrement sur Hedera
      analysisResult.hedera = await this.hederaService.recordHash(analysisResult.hash, {
        score: 0, // Sera mis à jour après calcul
        fileType: 'image',
        analysisSummary: 'Analyse en cours'
      });
      logger.info('Enregistrement Hedera terminé');

      // 7. Calcul du score final
      analysisResult.finalScore = this.calculateFinalScore(analysisResult);
      
      // 8. Mise à jour de l'enregistrement Hedera avec le score final
      if (analysisResult.hedera.success) {
        await this.hederaService.recordHash(analysisResult.hash, {
          score: analysisResult.finalScore,
          fileType: 'image',
          analysisSummary: `Score final: ${analysisResult.finalScore}/100`
        });
      }

      // 9. Génération du rapport
      analysisResult.report = this.generateReport(analysisResult);

      logger.info(`=== Analyse terminée. Score final: ${analysisResult.finalScore}/100 ===`);
      return analysisResult;

    } catch (error) {
      logger.error('Erreur lors de l\'analyse d\'image:', error);
      analysisResult.error = error.message;
      return analysisResult;
    } finally {
      // Nettoyage des fichiers temporaires
      if (tempFiles.length > 0) {
        await this.cleanupTempFiles(tempFiles);
      }
    }
  }

  /**
   * Analyse complète d'une vidéo
   */
  async analyzeVideo(videoPath) {
    logger.info('=== Démarrage de l\'analyse de vidéo ===');
    
    const tempDir = path.join(path.dirname(videoPath), 'temp_frames');
    
    const tempFiles = [];
    let analysisResult = {
      fileType: 'video',
      timestamp: new Date().toISOString(),
      hash: null,
      forensic: null,
      metadata: null,
      osint: null,
      sourceReliability: null,
      nlp: null,
      hedera: null,
      finalScore: 0,
      report: {}
    };

    try {
      // Création du dossier temporaire pour les frames (dans le try-catch)
      await fs.mkdir(tempDir, { recursive: true });
      // 1. Calcul du hash
      analysisResult.hash = await calculateFileHash(videoPath);
      logger.info(`Hash calculé: ${analysisResult.hash.substring(0, 16)}...`);

      // 2. Extraction des métadonnées
      analysisResult.metadata = await extractVideoMetadata(videoPath);

      // 3. Extraction des frames
      const frames = await extractVideoFrames(videoPath, tempDir);
      tempFiles.push(...frames);
      logger.info(`${frames.length} frames extraites`);

      // 4. Analyse forensique sur toutes les frames
      analysisResult.forensic = await this.forensicService.analyzeMultipleImages(frames);
      logger.info('Analyse forensique terminée');

      // 5. Analyse OSINT sur les frames clés (première, milieu, dernière)
      const keyFrames = [
        frames[0],
        frames[Math.floor(frames.length / 2)],
        frames[frames.length - 1]
      ].filter(Boolean);

      const osintResults = await Promise.allSettled(
        keyFrames.map(frame => this.osintService.reverseImageSearch(frame))
      );

      const successfulOsint = osintResults
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

      // Agrégation des résultats OSINT
      analysisResult.osint = this.aggregateOSINTResults(successfulOsint);
      logger.info('Analyse OSINT terminée');

      // 5.5. Vérification de la fiabilité des sources trouvées
      if (analysisResult.osint.sources && analysisResult.osint.sources.length > 0) {
        analysisResult.sourceReliability = await this.sourceReliabilityService.verifySources(
          analysisResult.osint.sources
        );
        logger.info('Vérification de fiabilité des sources terminée');
        
        // Ajustement du score OSINT basé sur la fiabilité des sources
        const reliabilityScore = analysisResult.sourceReliability.averageReliabilityScore;
        const originalOSINTScore = analysisResult.osint.score;
        // Pondération: 60% score OSINT original, 40% fiabilité des sources
        analysisResult.osint.score = Math.round(originalOSINTScore * 0.6 + reliabilityScore * 0.4);
        analysisResult.osint.reliabilityAnalysis = analysisResult.sourceReliability;
        
        // Mise à jour des sources avec les informations de fiabilité
        if (analysisResult.sourceReliability.verifiedSources) {
          analysisResult.osint.sources = analysisResult.sourceReliability.verifiedSources.map(vs => ({
            ...vs,
            reliability: vs.reliability
          }));
        }
      } else {
        analysisResult.sourceReliability = {
          verifiedSources: [],
          averageReliabilityScore: 50,
          reliableCount: 0,
          suspiciousCount: 0,
          analysis: 'Aucune source à vérifier'
        };
      }

      // 6. Analyse NLP (OCR sur frames clés)
      try {
        const ocrResults = await Promise.allSettled(
          keyFrames.map(frame => Tesseract.recognize(frame, 'fra+eng'))
        );
        
        const texts = ocrResults
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value.data.text)
          .join(' ');

        if (texts.trim().length > 50) {
          analysisResult.nlp = await this.nlpService.analyzeText(texts);
        } else {
          analysisResult.nlp = {
            score: 50,
            description: 'Pas de texte suffisant',
            confidence: 0.3
          };
        }
      } catch (error) {
        logger.warn('Erreur OCR vidéo:', error.message);
        analysisResult.nlp = {
          score: 50,
          description: 'Erreur OCR',
          confidence: 0
        };
      }

      // 7. Enregistrement Hedera
      analysisResult.hedera = await this.hederaService.recordHash(analysisResult.hash, {
        score: 0,
        fileType: 'video',
        analysisSummary: 'Analyse en cours'
      });

      // 8. Calcul du score final
      analysisResult.finalScore = this.calculateFinalScore(analysisResult);

      // 9. Rapport
      analysisResult.report = this.generateReport(analysisResult);

      logger.info(`=== Analyse terminée. Score final: ${analysisResult.finalScore}/100 ===`);
      return analysisResult;

    } catch (error) {
      logger.error('Erreur lors de l\'analyse de vidéo:', error);
      analysisResult.error = error.message;
      return analysisResult;
    } finally {
      // Nettoyage
      for (const file of tempFiles) {
        try {
          await fs.unlink(file);
        } catch (e) {
          logger.warn(`Impossible de supprimer ${file}`);
        }
      }
      try {
        await fs.rmdir(tempDir);
      } catch (e) {
        // Ignore
      }
    }
  }

  /**
   * Analyse complète d'un PDF
   */
  async analyzePDF(pdfPath) {
    logger.info('=== Démarrage de l\'analyse de PDF ===');
    
    let analysisResult = {
      fileType: 'pdf',
      timestamp: new Date().toISOString(),
      hash: null,
      forensic: null,
      metadata: null,
      osint: null,
      sourceReliability: null,
      nlp: null,
      pdfIntegrity: null,
      hedera: null,
      finalScore: 0,
      report: {}
    };

    try {
      // 1. Calcul du hash
      analysisResult.hash = await calculateFileHash(pdfPath);
      logger.info(`Hash calculé: ${analysisResult.hash.substring(0, 16)}...`);

      // 2. Extraction du texte
      const pdfBuffer = await fs.readFile(pdfPath);
      const pdfData = await pdfParse(pdfBuffer);
      const pdfText = pdfData.text;
      const pdfMetadata = pdfData.info;

      logger.info(`Texte extrait: ${pdfText.length} caractères`);

      // 3. Analyse de l'intégrité du PDF
      analysisResult.pdfIntegrity = await this.nlpService.analyzePDFStructure(pdfText, pdfMetadata);
      logger.info('Analyse d\'intégrité PDF terminée');

      // 4. Analyse forensique sur les images du PDF (si présentes)
      // Note: L'extraction d'images de PDF nécessiterait pdf-lib ou pdfjs-dist
      // Pour l'instant, on fait une analyse basique
      analysisResult.forensic = {
        manipulationScore: 50,
        description: 'Analyse forensique PDF (images non extraites)',
        signals: [],
        confidence: 0.5
      };

      // 5. Analyse OSINT (recherche du texte)
      if (pdfText.trim().length > 100) {
        analysisResult.osint = await this.osintService.searchText(pdfText);
        logger.info('Analyse OSINT terminée');
        
        // 5.5. Vérification de la fiabilité des sources trouvées
        if (analysisResult.osint.sources && analysisResult.osint.sources.length > 0) {
          analysisResult.sourceReliability = await this.sourceReliabilityService.verifySources(
            analysisResult.osint.sources
          );
          logger.info('Vérification de fiabilité des sources terminée');
          
          // Ajustement du score OSINT basé sur la fiabilité des sources
          const reliabilityScore = analysisResult.sourceReliability.averageReliabilityScore;
          const originalOSINTScore = analysisResult.osint.score;
          // Pondération: 60% score OSINT original, 40% fiabilité des sources
          analysisResult.osint.score = Math.round(originalOSINTScore * 0.6 + reliabilityScore * 0.4);
          analysisResult.osint.reliabilityAnalysis = analysisResult.sourceReliability;
        } else {
          analysisResult.sourceReliability = {
            verifiedSources: [],
            averageReliabilityScore: 50,
            reliableCount: 0,
            suspiciousCount: 0,
            analysis: 'Aucune source à vérifier'
          };
        }
      } else {
        analysisResult.osint = {
          sources: [],
          score: 50,
          occurrenceCount: 0,
          description: 'Texte insuffisant pour recherche OSINT'
        };
        analysisResult.sourceReliability = {
          verifiedSources: [],
          averageReliabilityScore: 50,
          reliableCount: 0,
          suspiciousCount: 0,
          analysis: 'Aucune source à vérifier'
        };
      }

      // 6. Analyse NLP
      if (pdfText.trim().length > 50) {
        analysisResult.nlp = await this.nlpService.analyzeText(pdfText);
        logger.info('Analyse NLP terminée');
      } else {
        analysisResult.nlp = {
          score: 50,
          description: 'Texte insuffisant',
          confidence: 0.3
        };
      }

      // 7. Métadonnées
      analysisResult.metadata = {
        hasMetadata: !!pdfMetadata,
        metadata: pdfMetadata,
        inconsistencies: [],
        credibilityReduction: 0
      };

      // 8. Enregistrement Hedera
      analysisResult.hedera = await this.hederaService.recordHash(analysisResult.hash, {
        score: 0,
        fileType: 'pdf',
        analysisSummary: 'Analyse en cours'
      });

      // 9. Calcul du score final
      analysisResult.finalScore = this.calculateFinalScore(analysisResult);

      // 10. Rapport
      analysisResult.report = this.generateReport(analysisResult);

      logger.info(`=== Analyse terminée. Score final: ${analysisResult.finalScore}/100 ===`);
      return analysisResult;

    } catch (error) {
      logger.error('Erreur lors de l\'analyse de PDF:', error);
      analysisResult.error = error.message;
      return analysisResult;
    }
  }

  /**
   * Calcule le score final pondéré
   */
  calculateFinalScore(analysis) {
    // Pondération: 40% forensics, 40% OSINT, 20% NLP/cohérence
    let forensicScore = 50;
    let osintScore = 50;
    let nlpScore = 50;

    // Score forensique
    if (analysis.forensic) {
      forensicScore = 100 - analysis.forensic.manipulationScore; // Inversé: plus de manipulation = moins crédible
    }

    // Score OSINT
    if (analysis.osint) {
      osintScore = analysis.osint.score;
    }

    // Score NLP/cohérence
    if (analysis.nlp) {
      nlpScore = analysis.nlp.score;
    } else if (analysis.pdfIntegrity) {
      nlpScore = analysis.pdfIntegrity.integrityScore;
    }

    // Application de la réduction de crédibilité des métadonnées
    let metadataReduction = 0;
    if (analysis.metadata && analysis.metadata.credibilityReduction) {
      metadataReduction = analysis.metadata.credibilityReduction;
    }

    // Calcul du score pondéré
    const weightedScore = (
      forensicScore * 0.4 +
      osintScore * 0.4 +
      nlpScore * 0.2
    );

    // Application de la réduction
    const finalScore = Math.max(0, Math.min(100, weightedScore * (1 - metadataReduction)));

    return Math.round(finalScore);
  }

  /**
   * Agrège les résultats OSINT de plusieurs frames
   */
  aggregateOSINTResults(osintResults) {
    if (osintResults.length === 0) {
      return {
        sources: [],
        score: 50,
        occurrenceCount: 0,
        coherenceScore: 50
      };
    }

    const allSources = osintResults.flatMap(r => r.sources || []);
    const uniqueSources = Array.from(
      new Map(allSources.map(s => [s.url, s])).values()
    );

    const avgScore = osintResults.reduce((sum, r) => sum + (r.score || 50), 0) / osintResults.length;
    const avgCoherence = osintResults.reduce((sum, r) => sum + (r.coherenceScore || 50), 0) / osintResults.length;

    return {
      sources: uniqueSources,
      score: Math.round(avgScore),
      occurrenceCount: uniqueSources.length,
      coherenceScore: Math.round(avgCoherence),
      earliestDate: this.findEarliestDate(allSources),
      latestDate: this.findLatestDate(allSources)
    };
  }

  findEarliestDate(sources) {
    const dates = sources
      .map(s => s.date ? new Date(s.date) : null)
      .filter(d => d !== null)
      .sort((a, b) => a - b);
    return dates.length > 0 ? dates[0].toISOString() : null;
  }

  findLatestDate(sources) {
    const dates = sources
      .map(s => s.date ? new Date(s.date) : null)
      .filter(d => d !== null)
      .sort((a, b) => b - a);
    return dates.length > 0 ? dates[0].toISOString() : null;
  }

  /**
   * Génère le rapport complet
   */
  generateReport(analysis) {
    const report = {
      summary: {
        fileType: analysis.fileType,
        finalScore: analysis.finalScore,
        timestamp: analysis.timestamp,
        hash: analysis.hash
      },
      forensic: {
        score: analysis.forensic ? (100 - analysis.forensic.manipulationScore) : 50,
        manipulationScore: analysis.forensic?.manipulationScore || 50,
        deepfakeScore: analysis.forensic?.deepfakeScore || 50,
        signals: analysis.forensic?.signals || [],
        description: analysis.forensic?.description || 'Non analysé'
      },
      osint: {
        score: analysis.osint?.score || 50,
        sources: analysis.osint?.sources || [],
        occurrenceCount: analysis.osint?.occurrenceCount || 0,
        coherenceScore: analysis.osint?.coherenceScore || 50,
        earliestDate: analysis.osint?.earliestDate || null,
        latestDate: analysis.osint?.latestDate || null,
        sourceReliability: analysis.sourceReliability ? {
          averageReliabilityScore: analysis.sourceReliability.averageReliabilityScore,
          reliableCount: analysis.sourceReliability.reliableCount,
          suspiciousCount: analysis.sourceReliability.suspiciousCount,
          totalSources: analysis.sourceReliability.totalSources,
          analysis: analysis.sourceReliability.analysis
        } : null
      },
      nlp: {
        score: analysis.nlp?.score || 50,
        contradictions: analysis.nlp?.contradictions || [],
        propagandaIndicators: analysis.nlp?.propagandaIndicators || [],
        generatedContentIndicators: analysis.nlp?.generatedContentIndicators || [],
        hallucinations: analysis.nlp?.hallucinations || [],
        internalInconsistencies: analysis.nlp?.internalInconsistencies || [],
        biasIndicators: analysis.nlp?.biasIndicators || [],
        description: analysis.nlp?.description || 'Non analysé'
      },
      metadata: {
        hasMetadata: analysis.metadata?.hasMetadata || false,
        inconsistencies: analysis.metadata?.inconsistencies || [],
        credibilityReduction: analysis.metadata?.credibilityReduction || 0
      },
      hedera: {
        success: analysis.hedera?.success || false,
        fileId: analysis.hedera?.fileId || null,
        transactionId: analysis.hedera?.transactionId || null,
        proof: analysis.hedera?.proof || null
      },
      redFlags: [],
      crediblePoints: [],
      confidence: this.calculateConfidence(analysis),
      explanation: this.generateExplanation(analysis)
    };

    // Identification des red flags
    if (analysis.forensic?.manipulationScore > 70) {
      report.redFlags.push('Score de manipulation élevé détecté');
    }
    if (analysis.osint?.occurrenceCount === 0) {
      report.redFlags.push('Aucune source trouvée en ligne');
    }
    if (analysis.sourceReliability && analysis.sourceReliability.suspiciousCount > analysis.sourceReliability.reliableCount) {
      report.redFlags.push(`${analysis.sourceReliability.suspiciousCount} source(s) suspecte(s) détectée(s)`);
    }
    if (analysis.sourceReliability && analysis.sourceReliability.averageReliabilityScore < 40) {
      report.redFlags.push('Fiabilité moyenne des sources très faible');
    }
    if (analysis.metadata?.inconsistencies?.length > 0) {
      report.redFlags.push(`${analysis.metadata.inconsistencies.length} incohérence(s) dans les métadonnées`);
    }
    if (analysis.nlp?.contradictions?.length > 0) {
      report.redFlags.push(`${analysis.nlp.contradictions.length} contradiction(s) logique(s) détectée(s)`);
    }

    // Points crédibles
    if (analysis.forensic?.manipulationScore < 30) {
      report.crediblePoints.push('Aucun signe de manipulation détecté');
    }
    if (analysis.osint?.occurrenceCount > 5) {
      report.crediblePoints.push(`Plusieurs sources trouvées (${analysis.osint.occurrenceCount})`);
    }
    if (analysis.sourceReliability && analysis.sourceReliability.reliableCount > 0) {
      report.crediblePoints.push(`${analysis.sourceReliability.reliableCount} source(s) fiable(s) vérifiée(s)`);
    }
    if (analysis.sourceReliability && analysis.sourceReliability.averageReliabilityScore > 70) {
      report.crediblePoints.push('Sources globalement fiables');
    }
    if (analysis.metadata?.hasMetadata && analysis.metadata.inconsistencies.length === 0) {
      report.crediblePoints.push('Métadonnées cohérentes et complètes');
    }
    if (analysis.nlp?.score > 70) {
      report.crediblePoints.push('Contenu sémantiquement cohérent');
    }

    return report;
  }

  /**
   * Calcule le niveau de confiance global
   */
  calculateConfidence(analysis) {
    let confidence = 0.5;
    let factors = 0;

    if (analysis.forensic?.confidence) {
      confidence += analysis.forensic.confidence * 0.3;
      factors += 0.3;
    }
    if (analysis.osint && analysis.osint.occurrenceCount > 0) {
      confidence += 0.2;
      factors += 0.2;
    }
    if (analysis.nlp?.confidence) {
      confidence += analysis.nlp.confidence * 0.2;
      factors += 0.2;
    }
    if (analysis.hedera?.success) {
      confidence += 0.1;
      factors += 0.1;
    }

    return Math.min(1, confidence / Math.max(factors, 1));
  }

  /**
   * Génère une explication du score final
   */
  generateExplanation(analysis) {
    const parts = [];
    
    parts.push(`Score final: ${analysis.finalScore}/100`);
    parts.push(`\nAnalyse forensique (40%): ${100 - (analysis.forensic?.manipulationScore || 50)}/100`);
    parts.push(`Analyse OSINT (40%): ${analysis.osint?.score || 50}/100`);
    parts.push(`Analyse sémantique/NLP (20%): ${analysis.nlp?.score || 50}/100`);
    
    if (analysis.metadata?.credibilityReduction > 0) {
      parts.push(`\nRéduction de crédibilité (métadonnées): ${(analysis.metadata.credibilityReduction * 100).toFixed(1)}%`);
    }
    
    return parts.join('\n');
  }

  async cleanupTempFiles(files) {
    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (e) {
        logger.warn(`Impossible de supprimer ${file}`);
      }
    }
  }
}

export default AnalysisService;

