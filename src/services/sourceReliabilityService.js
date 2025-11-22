import OpenAI from 'openai';
import logger from '../config/logger.js';

/**
 * Service de vérification de fiabilité des sources
 * Utilise OpenAI GPT pour analyser la crédibilité des sources trouvées
 */
class SourceReliabilityService {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    
    // Liste de domaines connus comme fiables (peut être étendue)
    this.trustedDomains = [
      // Médias internationaux fiables
      'reuters.com', 'ap.org', 'bbc.com', 'bbc.co.uk', 'theguardian.com',
      'nytimes.com', 'washingtonpost.com', 'wsj.com', 'economist.com',
      'lemonde.fr', 'lefigaro.fr', 'liberation.fr', 'france24.com',
      'spiegel.de', 'zeit.de', 'corriere.it', 'elpais.com',
      // Sources académiques et scientifiques
      'nature.com', 'science.org', 'pubmed.ncbi.nlm.nih.gov', 'arxiv.org',
      'scholar.google.com', 'jstor.org', 'springer.com', 'elsevier.com',
      // Organisations gouvernementales et internationales
      'gov.uk', 'gov.fr', 'europa.eu', 'who.int', 'un.org', 'ec.europa.eu',
      'nasa.gov', 'nih.gov', 'cdc.gov', 'fda.gov',
      // Extensions de confiance
      '.edu', '.gov', '.ac.uk', '.ac.fr', '.org'
    ];
    
    // Liste de domaines suspects connus
    this.suspiciousDomains = [
      // Plateformes de blogs non vérifiés
      'blogspot.com', 'wordpress.com', 'tumblr.com', 'medium.com',
      // Réseaux sociaux (contenu non vérifié)
      'reddit.com', '4chan.org', '8kun.top', 'parler.com',
      // Sites de désinformation connus
      'infowars.com', 'breitbart.com', 'naturalnews.com'
    ];
  }

  /**
   * Vérifie la fiabilité d'une liste de sources
   */
  async verifySources(sources) {
    if (!sources || sources.length === 0) {
      return {
        verifiedSources: [],
        averageReliabilityScore: 50,
        reliableCount: 0,
        suspiciousCount: 0,
        analysis: 'Aucune source à vérifier'
      };
    }

    logger.info(`Vérification de la fiabilité de ${sources.length} sources...`);

    // Vérification en batch pour optimiser les appels API
    const batchSize = 5;
    const verifiedSources = [];
    
    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(source => this.verifySingleSource(source))
      );
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          verifiedSources.push({
            ...batch[index],
            reliability: result.value
          });
        } else {
          logger.warn(`Erreur lors de la vérification de la source ${batch[index].url}:`, result.reason);
          verifiedSources.push({
            ...batch[index],
            reliability: {
              score: 50,
              isReliable: false,
              reasons: ['Erreur lors de la vérification'],
              confidence: 0
            }
          });
        }
      });
    }

    // Calcul des statistiques
    const scores = verifiedSources.map(s => s.reliability.score);
    const averageScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 50;

    const reliableCount = verifiedSources.filter(s => s.reliability.isReliable).length;
    const suspiciousCount = verifiedSources.filter(s => !s.reliability.isReliable).length;

    logger.info(`Vérification terminée: ${reliableCount} sources fiables, ${suspiciousCount} sources suspectes`);

    return {
      verifiedSources,
      averageReliabilityScore: Math.round(averageScore),
      reliableCount,
      suspiciousCount,
      totalSources: sources.length,
      analysis: this.generateAnalysisSummary(verifiedSources)
    };
  }

  /**
   * Vérifie la fiabilité d'une source unique
   */
  async verifySingleSource(source) {
    try {
      const url = source.url || '';
      const domain = this.extractDomain(url);
      const title = source.title || '';
      const snippet = source.snippet || '';

      // Vérification rapide basée sur le domaine
      const quickCheck = this.quickDomainCheck(domain);
      if (quickCheck.confidence > 0.8) {
        return quickCheck;
      }

      // Analyse approfondie avec GPT
      const gptAnalysis = await this.analyzeWithGPT(url, domain, title, snippet);
      
      // Combinaison des résultats (pondération: 30% vérification rapide, 70% analyse GPT)
      const combinedScore = Math.round((quickCheck.score * 0.3 + gptAnalysis.score * 0.7));
      
      return {
        score: combinedScore,
        isReliable: combinedScore >= 60 || gptAnalysis.isReliable,
        reasons: [...quickCheck.reasons, ...gptAnalysis.reasons],
        confidence: Math.max(quickCheck.confidence, gptAnalysis.confidence),
        domain: domain,
        category: gptAnalysis.category || 'unknown',
        biasLevel: gptAnalysis.biasLevel || 'unknown',
        editorialStandards: gptAnalysis.editorialStandards || 'unknown'
      };
    } catch (error) {
      logger.error('Erreur lors de la vérification de source:', error);
      return {
        score: 50,
        isReliable: false,
        reasons: ['Erreur lors de l\'analyse'],
        confidence: 0,
        domain: this.extractDomain(source.url || ''),
        category: 'unknown'
      };
    }
  }

  /**
   * Vérification rapide basée sur le domaine
   */
  quickDomainCheck(domain) {
    if (!domain) {
      return {
        score: 30,
        isReliable: false,
        reasons: ['Domaine non identifiable'],
        confidence: 0.5
      };
    }

    const lowerDomain = domain.toLowerCase();

    // Vérification des domaines de confiance
    for (const trusted of this.trustedDomains) {
      if (lowerDomain.includes(trusted)) {
        return {
          score: 85,
          isReliable: true,
          reasons: [`Domaine reconnu comme fiable: ${trusted}`],
          confidence: 0.9
        };
      }
    }

    // Vérification des domaines suspects
    for (const suspicious of this.suspiciousDomains) {
      if (lowerDomain.includes(suspicious)) {
        return {
          score: 35,
          isReliable: false,
          reasons: [`Domaine connu pour contenir du contenu non vérifié: ${suspicious}`],
          confidence: 0.7
        };
      }
    }

    // Extension de domaine
    const extension = lowerDomain.split('.').pop();
    const trustedExtensions = ['edu', 'gov', 'org', 'ac.uk', 'ac.fr'];
    if (trustedExtensions.includes(extension)) {
      return {
        score: 70,
        isReliable: true,
        reasons: [`Extension de domaine fiable: .${extension}`],
        confidence: 0.6
      };
    }

    return {
      score: 50,
      isReliable: false,
      reasons: ['Domaine non classé'],
      confidence: 0.3
    };
  }

  /**
   * Analyse approfondie avec GPT
   */
  async analyzeWithGPT(url, domain, title, snippet) {
    try {
      const prompt = `Analyse la fiabilité et la crédibilité de cette source web en tant qu'expert en fact-checking et vérification de sources.

URL: ${url}
Domaine: ${domain}
Titre: ${title}
Extrait: ${snippet ? snippet.substring(0, 300) : 'Aucun extrait disponible'}

Évalue cette source sur les critères suivants:
1. Réputation du domaine et du site (médias établis, institutions académiques, organisations gouvernementales)
2. Type de source (média établi avec rédaction, blog personnel, réseau social, site académique, etc.)
3. Historique de fiabilité et fact-checking (si connu)
4. Présence de biais connus (politique, idéologique, commercial)
5. Qualité éditoriale et standards journalistiques
6. Transparence sur les sources et méthodologie
7. Vérifiabilité des informations

Considère:
- Les médias établis avec rédaction professionnelle sont généralement plus fiables
- Les sites .edu, .gov, .org (organisations) ont souvent plus de crédibilité
- Les blogs personnels et réseaux sociaux sont moins fiables
- Les sites connus pour la désinformation doivent être marqués comme non fiables

Réponds en JSON avec cette structure:
{
  "score": 0-100,
  "isReliable": true/false,
  "reasons": ["raison 1", "raison 2", "raison 3"],
  "category": "media|academic|government|blog|social|news_aggregator|unknown",
  "confidence": 0.0-1.0,
  "biasLevel": "none|low|medium|high",
  "editorialStandards": "high|medium|low|none"
}

Score: 80-100 = très fiable, 60-79 = fiable, 40-59 = douteux, 0-39 = non fiable
isReliable: true si score >= 60, false sinon`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en vérification de sources et fact-checking. Analyse les sources web de manière objective et factuelle. Base-toi sur la réputation connue des médias et domaines.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 500
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      // Déterminer isReliable basé sur le score si non fourni
      const score = analysis.score || 50;
      const isReliable = analysis.isReliable !== undefined 
        ? analysis.isReliable 
        : score >= 60;
      
      return {
        score: score,
        isReliable: isReliable,
        reasons: analysis.reasons || [],
        category: analysis.category || 'unknown',
        confidence: analysis.confidence || 0.7,
        biasLevel: analysis.biasLevel || 'unknown',
        editorialStandards: analysis.editorialStandards || 'unknown'
      };
    } catch (error) {
      logger.error('Erreur lors de l\'analyse GPT de la source:', error);
      return {
        score: 50,
        isReliable: false,
        reasons: ['Erreur lors de l\'analyse'],
        category: 'unknown',
        confidence: 0,
        biasLevel: 'unknown',
        editorialStandards: 'unknown'
      };
    }
  }

  /**
   * Extrait le domaine d'une URL
   */
  extractDomain(url) {
    try {
      if (!url) return '';
      
      // Supprimer le protocole
      let domain = url.replace(/^https?:\/\//, '');
      
      // Supprimer www.
      domain = domain.replace(/^www\./, '');
      
      // Extraire le domaine principal
      const parts = domain.split('/');
      domain = parts[0];
      
      // Supprimer le port si présent
      domain = domain.split(':')[0];
      
      return domain;
    } catch (error) {
      logger.warn('Erreur lors de l\'extraction du domaine:', error);
      return '';
    }
  }

  /**
   * Génère un résumé de l'analyse
   */
  generateAnalysisSummary(verifiedSources) {
    if (verifiedSources.length === 0) {
      return 'Aucune source vérifiée';
    }

    const reliable = verifiedSources.filter(s => s.reliability.isReliable);
    const suspicious = verifiedSources.filter(s => !s.reliability.isReliable);
    
    const categories = {};
    verifiedSources.forEach(s => {
      const cat = s.reliability.category || 'unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const parts = [];
    parts.push(`${reliable.length} source(s) fiable(s) sur ${verifiedSources.length}`);
    
    if (suspicious.length > 0) {
      parts.push(`${suspicious.length} source(s) suspecte(s) détectée(s)`);
    }

    const mainCategory = Object.keys(categories).reduce((a, b) => 
      categories[a] > categories[b] ? a : b
    );
    
    if (mainCategory !== 'unknown') {
      parts.push(`Catégorie principale: ${mainCategory}`);
    }

    return parts.join('. ');
  }
}

export default SourceReliabilityService;

