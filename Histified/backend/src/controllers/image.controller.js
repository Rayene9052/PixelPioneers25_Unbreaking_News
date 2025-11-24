class ImageController {
  constructor(verificationService) {
    this.verificationService = verificationService;
  }

  async verifyImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }

      const fileBuffer = req.file.buffer;
      const result = await this.verificationService.verifyImage(
        fileBuffer, 
        req.file.originalname
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ImageController;
