const pdfParse = require('pdf-parse').default || require('pdf-parse');

class PDFExtractionService {
  async extractFromPDF(fileBuffer) {
    try {
      const data = await pdfParse(fileBuffer);
      
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info,
        metadata: {
          title: data.info.Title || 'Unknown',
          author: data.info.Author || 'Unknown',
          creator: data.info.Creator || 'Unknown',
          producer: data.info.Producer || 'Unknown',
          creationDate: data.info.CreationDate || 'Unknown',
          modificationDate: data.info.ModDate || 'Unknown',
          subject: data.info.Subject || 'Unknown'
        },
        wordCount: this.countWords(data.text),
        characterCount: data.text.length
      };
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  extractUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  }

  extractEmails(text) {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    return text.match(emailRegex) || [];
  }

  extractDates(text) {
    const dateRegex = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g;
    return text.match(dateRegex) || [];
  }
}

module.exports = PDFExtractionService;
