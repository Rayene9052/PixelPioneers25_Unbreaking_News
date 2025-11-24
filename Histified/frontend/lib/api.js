const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
// .env file must set NEXT_PUBLIC_API_URL

class VerificationAPI {
  async verifyImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/images/verify`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Image verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying image:', error);
      throw error;
    }
  }

  async verifyArticle(pdfFile) {
    const formData = new FormData();
    formData.append('article', pdfFile);

    try {
      const response = await fetch(`${API_BASE_URL}/articles/verify`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Article verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying article:', error);
      throw error;
    }
  }
}

export default new VerificationAPI();
