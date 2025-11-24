class ArticleController {
  constructor(verificationService) {
    this.verificationService = verificationService;
  }

  async verifyArticle(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      const fileBuffer = req.file.buffer;
      const result = await this.verificationService.verifyArticle(
        fileBuffer,
        req.file.originalname
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ArticleController;
