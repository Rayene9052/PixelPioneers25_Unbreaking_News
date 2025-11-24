const natural = require('natural');
const Sentiment = require('sentiment');


class ArticleAnalysisService {
  constructor() {
    this.sentiment = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
  }

  analyzeArticle(extractedData) {
    const { text, metadata, wordCount } = extractedData;
    
    return {
      documentMetadata: this.analyzeMetadata(metadata),
      sourceCitations: this.analyzeCitations(text, extractedData),
      writingQuality: this.analyzeWritingQuality(text, wordCount),
      factualClaims: this.analyzeFactualClaims(text),
      biasDetection: this.analyzeBias(text)
    };
  }

  analyzeMetadata(metadata) {
    let score = 0;
    let maxScore = 20;
    const findings = [];
    
    if (metadata.author && metadata.author !== 'Unknown') {
      score += 5;
      findings.push(`✅ Author identified: ${metadata.author}`);
    } else {
      findings.push('⚠️ No author information');
    }
    
    if (metadata.creationDate && metadata.creationDate !== 'Unknown') {
      score += 5;
      findings.push('✅ Creation date available');
      
      if (metadata.modificationDate !== metadata.creationDate) {
        findings.push('ℹ️ Document has been modified after creation');
      }
    } else {
      findings.push('⚠️ No creation date');
    }
    
    if (metadata.title && metadata.title !== 'Unknown' && metadata.title.length > 3) {
      score += 5;
      findings.push('✅ Document title present');
    } else {
      findings.push('⚠️ No document title');
    }
    
    if (metadata.creator && metadata.creator !== 'Unknown') {
      score += 5;
      findings.push(`ℹ️ Creator: ${metadata.creator}`);
    }
    
    return {
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      findings,
      metadata: {
        hasAuthor: metadata.author !== 'Unknown',
        hasDate: metadata.creationDate !== 'Unknown',
        hasTitle: metadata.title !== 'Unknown',
        creator: metadata.creator
      }
    };
  }

  analyzeCitations(text, extractedData) {
    let score = 0;
    let maxScore = 25;
    const findings = [];
    
    const urls = this.extractUrls(text);
    if (urls.length > 0) {
      score += 10;
      findings.push(`✅ Contains ${urls.length} URL references`);
      
      const credibleDomains = urls.filter(url => 
        /\.(edu|gov|org|ac\.uk|reuters|bbc|apnews|nytimes)/.test(url)
      );
      if (credibleDomains.length > 0) {
        score += 5;
        findings.push(`✅ ${credibleDomains.length} links to credible sources`);
      }
    } else {
      findings.push('⚠️ No URL references found');
    }
    
    const citationPatterns = [
      /\([A-Z][a-z]+,?\s+\d{4}\)/g,
      /\[[0-9]+\]/g,
      /\b[A-Z][a-z]+\s+et\s+al\./g
    ];
    
    let citationCount = 0;
    citationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) citationCount += matches.length;
    });
    
    if (citationCount > 0) {
      score += 10;
      findings.push(`✅ Contains ${citationCount} academic-style citations`);
    } else {
      findings.push('⚠️ No formal citations detected');
    }
    
    return {
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      findings,
      details: {
        urlCount: urls.length,
        citationCount,
        urls: urls.slice(0, 5)
      }
    };
  }

  extractUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  }

  analyzeWritingQuality(text, wordCount) {
    let score = 0;
    let maxScore = 20;
    const findings = [];
    
    if (wordCount >= 300 && wordCount <= 5000) {
      score += 5;
      findings.push(`✅ Appropriate length: ${wordCount} words`);
    } else if (wordCount < 300) {
      findings.push(`⚠️ Too short: ${wordCount} words`);
    } else {
      findings.push(`ℹ️ Very long article: ${wordCount} words`);
      score += 3;
    }
    
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length >= 3) {
      score += 5;
      findings.push(`✅ Well-structured: ${paragraphs.length} paragraphs`);
    } else {
      findings.push('⚠️ Poor paragraph structure');
    }
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = wordCount / sentences.length;
    
    if (avgSentenceLength >= 10 && avgSentenceLength <= 25) {
      score += 5;
      findings.push('✅ Good sentence complexity');
    } else {
      score += 2;
      findings.push('ℹ️ Sentence length could be improved');
    }
    
    const words = this.tokenizer.tokenize(text.toLowerCase());
    const uniqueWords = new Set(words);
    const lexicalDiversity = uniqueWords.size / words.length;
    
    if (lexicalDiversity > 0.4) {
      score += 5;
      findings.push('✅ Rich vocabulary');
    } else if (lexicalDiversity > 0.3) {
      score += 3;
      findings.push('ℹ️ Moderate vocabulary diversity');
    } else {
      findings.push('⚠️ Limited vocabulary');
    }
    
    return {
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      findings,
      metrics: {
        wordCount,
        paragraphCount: paragraphs.length,
        sentenceCount: sentences.length,
        avgSentenceLength: avgSentenceLength.toFixed(1),
        lexicalDiversity: (lexicalDiversity * 100).toFixed(1) + '%'
      }
    };
  }

  analyzeFactualClaims(text) {
  let score = 0;
  let maxScore = 20;
  const findings = [];
  
  // Extraire dates avec regex
  const datePatterns = [
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,  // DD/MM/YYYY
    /\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g,     // YYYY-MM-DD
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi
  ];
  
  let dates = [];
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) dates = dates.concat(matches);
  });
  
  if (dates.length > 0) {
    score += 5;
    findings.push(`✅ Contains ${dates.length} specific dates`);
  }
  
  // Extraire nombres/statistiques
  const numberPattern = /\b\d+(?:,\d{3})*(?:\.\d+)?%?\b/g;
  const numbers = text.match(numberPattern) || [];
  
  if (numbers.length >= 5) {
    score += 5;
    findings.push(`✅ Contains ${numbers.length} numerical claims`);
  } else if (numbers.length > 0) {
    score += 3;
    findings.push(`ℹ️ Contains ${numbers.length} numerical claims`);
  }
  
  // Extraire noms propres (capitalisés)
  const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
  const people = text.match(namePattern) || [];
  const uniquePeople = [...new Set(people)];
  
  if (uniquePeople.length > 0) {
    score += 5;
    findings.push(`✅ Mentions ${uniquePeople.length} specific individuals`);
  }
  
  // Extraire lieux (pattern simplifié)
  const placeKeywords = ['in', 'at', 'from', 'to'];
  const placePattern = new RegExp(`\\b(${placeKeywords.join('|')})\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)\\b`, 'g');
  const places = [];
  let match;
  while ((match = placePattern.exec(text)) !== null) {
    places.push(match[2]);
  }
  const uniquePlaces = [...new Set(places)];
  
  if (uniquePlaces.length > 0) {
    score += 5;
    findings.push(`✅ References ${uniquePlaces.length} specific locations`);
  }
  
  return {
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    findings: findings.length > 0 ? findings : ['⚠️ Limited factual claims detected'],
    claims: {
      dates: dates.slice(0, 5),
      people: uniquePeople.slice(0, 5),
      places: uniquePlaces.slice(0, 5),
      numbers: numbers.slice(0, 5)
    }
  };
}


  analyzeBias(text) {
    let score = 15;
    let maxScore = 15;
    const findings = [];
    
    const sentimentResult = this.sentiment.analyze(text);
    const sentimentScore = sentimentResult.score;
    const avgSentiment = sentimentScore / text.split(/\s+/).length;
    
    if (Math.abs(avgSentiment) < 0.02) {
      findings.push('✅ Neutral tone detected');
    } else if (Math.abs(avgSentiment) < 0.05) {
      score -= 3;
      findings.push('ℹ️ Slight emotional tone detected');
    } else {
      score -= 7;
      findings.push('⚠️ Strong emotional bias detected');
    }
    
    const sensationalWords = [
      'shocking', 'unbelievable', 'amazing', 'incredible', 'outrageous',
      'devastating', 'horrifying', 'miraculous', 'stunning'
    ];
    
    let sensationalCount = 0;
    sensationalWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) sensationalCount += matches.length;
    });
    
    if (sensationalCount > 5) {
      score -= 5;
      findings.push(`⚠️ Excessive sensational language (${sensationalCount} instances)`);
    } else if (sensationalCount > 0) {
      score -= 2;
      findings.push(`ℹ️ Some sensational language (${sensationalCount} instances)`);
    } else {
      findings.push('✅ No sensational language');
    }
    
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 10) {
      score -= 3;
      findings.push(`⚠️ Excessive exclamation marks (${exclamationCount})`);
    }
    
    score = Math.max(0, score);
    
    return {
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      findings,
      metrics: {
        sentimentScore: sentimentScore,
        avgSentiment: avgSentiment.toFixed(4),
        tone: Math.abs(avgSentiment) < 0.02 ? 'Neutral' : 
              avgSentiment > 0 ? 'Positive' : 'Negative',
        sensationalWordCount: sensationalCount,
        exclamationCount
      }
    };
  }
}

module.exports = ArticleAnalysisService;
