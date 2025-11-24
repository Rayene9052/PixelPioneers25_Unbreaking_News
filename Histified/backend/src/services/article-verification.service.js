class ArticleVerificationService {
  constructor(pdfExtractionService, articleAnalysisService) {
    this.pdfExtractionService = pdfExtractionService;
    this.articleAnalysisService = articleAnalysisService;
  }

  async verifyArticle(fileBuffer, filename) {
    try {
      const extractedData = await this.pdfExtractionService.extractFromPDF(fileBuffer);
      const analysis = this.articleAnalysisService.analyzeArticle(extractedData);
      const credibilityScore = this.calculateCredibilityScore(analysis);
      
      return {
        filename,
        summary: {
          credibilityScore: credibilityScore.score,
          verdict: credibilityScore.verdict,
          status: credibilityScore.status,
          confidence: credibilityScore.confidence,
          explanation: credibilityScore.explanation
        },
        documentInfo: {
          pages: extractedData.pages,
          wordCount: extractedData.wordCount,
          characterCount: extractedData.characterCount,
          metadata: extractedData.metadata
        },
        detailedAnalysis: {
          documentMetadata: analysis.documentMetadata,
          sourceCitations: analysis.sourceCitations,
          writingQuality: analysis.writingQuality,
          factualClaims: analysis.factualClaims,
          biasDetection: analysis.biasDetection
        },
        recommendations: this.getRecommendations(credibilityScore, analysis)
      };
    } catch (error) {
      throw new Error(`Article verification failed: ${error.message}`);
    }
  }

  calculateCredibilityScore(analysis) {
    const scores = {
      metadata: analysis.documentMetadata.score,
      citations: analysis.sourceCitations.score,
      writing: analysis.writingQuality.score,
      factual: analysis.factualClaims.score,
      bias: analysis.biasDetection.score
    };
    
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const finalScore = Math.round(totalScore);
    
    let verdict, status, confidence, explanation;
    
    if (finalScore >= 75) {
      verdict = 'CREDIBLE';
      status = '✅ PASS';
      confidence = 'HIGH';
      explanation = 'Article meets professional journalism standards with proper sourcing and neutral tone.';
    } else if (finalScore >= 55) {
      verdict = 'QUESTIONABLE';
      status = '⚠️ WARNING';
      confidence = 'MEDIUM';
      explanation = 'Article has some credibility issues. Verify claims independently before citing.';
    } else {
      verdict = 'NOT_CREDIBLE';
      status = '❌ FAIL';
      confidence = 'LOW';
      explanation = 'Article lacks proper sourcing, shows bias, or has quality issues.';
    }
    
    return {
      score: finalScore,
      verdict,
      status,
      confidence,
      explanation,
      breakdown: {
        documentMetadata: `${scores.metadata}/20`,
        sourceCitations: `${scores.citations}/25`,
        writingQuality: `${scores.writing}/20`,
        factualClaims: `${scores.factual}/20`,
        biasDetection: `${scores.bias}/15`
      }
    };
  }

  getRecommendations(credibilityScore, analysis) {
    const recommendations = [];
    
    if (credibilityScore.verdict === 'NOT_CREDIBLE') {
      recommendations.push({
        priority: '🔴 CRITICAL',
        action: 'Do not publish or cite this article',
        reason: 'Fails credibility standards'
      });
    }
    
    if (analysis.sourceCitations.score < 15) {
      recommendations.push({
        priority: '🔴 CRITICAL',
        action: 'Verify all claims independently',
        reason: 'Insufficient source citations'
      });
    }
    
    if (analysis.biasDetection.score < 10) {
      recommendations.push({
        priority: '🟡 HIGH',
        action: 'Check for bias and cross-reference',
        reason: 'Strong emotional language detected'
      });
    }
    
    if (credibilityScore.verdict === 'CREDIBLE') {
      recommendations.push({
        priority: '🟢 INFO',
        action: 'Article appears credible',
        reason: 'Meets professional journalism standards'
      });
    }
    
    return recommendations;
  }
}

module.exports = ArticleVerificationService;
