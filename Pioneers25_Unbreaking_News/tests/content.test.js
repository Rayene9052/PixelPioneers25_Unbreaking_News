/**
 * Tests pour les routes de contenu
 */
const request = require('supertest');
const app = require('../server');
const { Content } = require('../models');

describe('Content API', () => {
  beforeEach(async () => {
    // Nettoyer la base de données de test
    await Content.destroy({ where: {}, truncate: true });
  });

  describe('POST /api/v1/content/upload', () => {
    it('devrait uploader un fichier image', async () => {
      // Créer un fichier de test simulé
      const response = await request(app)
        .post('/api/v1/content/upload')
        .attach('file', Buffer.from('fake image data'), 'test.jpg');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content_id');
      expect(response.body.content_type).toBe('image');
    });

    it('devrait rejeter un type de fichier non supporté', async () => {
      const response = await request(app)
        .post('/api/v1/content/upload')
        .attach('file', Buffer.from('fake data'), 'test.xyz');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/content/:content_id', () => {
    it('devrait récupérer un contenu existant', async () => {
      // Créer un contenu de test
      const content = await Content.create({
        filename: 'test.jpg',
        filePath: './test.jpg',
        contentType: 'image',
        fileSize: 1024
      });

      const response = await request(app)
        .get(`/api/v1/content/${content.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(content.id);
    });

    it('devrait retourner 404 pour un contenu inexistant', async () => {
      const response = await request(app)
        .get('/api/v1/content/99999');

      expect(response.status).toBe(404);
    });
  });
});

