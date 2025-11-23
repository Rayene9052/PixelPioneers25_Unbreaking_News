/**
 * Tests pour les détecteurs IA
 */
const ImageAIDetector = require('../../services/aiDetection/ImageDetector');
const TextAIDetector = require('../../services/aiDetection/TextDetector');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

describe('AI Detection Services', () => {
  let testImagePath;

  beforeAll(async () => {
    // Créer une image de test
    testImagePath = path.join(__dirname, '../temp_test_image.jpg');
    const image = sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    });
    await image.jpeg().toFile(testImagePath);
  });

  afterAll(async () => {
    // Nettoyer
    try {
      await fs.unlink(testImagePath);
    } catch (error) {
      // Ignorer
    }
  });

  describe('ImageAIDetector', () => {
    it('devrait détecter une image et retourner un score', async () => {
      const detector = new ImageAIDetector();
      const result = await detector.detect(testImagePath);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('confidence');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('devrait gérer les erreurs gracieusement', async () => {
      const detector = new ImageAIDetector();
      const result = await detector.detect('nonexistent.jpg');

      expect(result).toHaveProperty('score');
      expect(result.score).toBe(0.5);
    });
  });

  describe('TextAIDetector', () => {
    it('devrait détecter un texte et retourner un score', () => {
      const detector = new TextAIDetector();
      const text = 'Ceci est un texte de test pour vérifier le fonctionnement.';
      const result = detector.detect(text);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('confidence');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('devrait détecter un texte qui ressemble à de l\'IA', () => {
      const detector = new TextAIDetector();
      const aiText = 'Furthermore, it is important to note that this topic is indeed significant. In conclusion, we can summarize that...';
      const result = detector.detect(aiText);

      expect(result.score).toBeGreaterThan(0.5);
    });

    it('devrait gérer un texte vide', () => {
      const detector = new TextAIDetector();
      const result = detector.detect('');

      expect(result.score).toBe(0.5);
      expect(result.error).toBe('Texte vide');
    });
  });
});

