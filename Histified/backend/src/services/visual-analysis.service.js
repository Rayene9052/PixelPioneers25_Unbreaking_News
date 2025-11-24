const sharp = require('sharp');

class VisualContentAnalysisService {
  async analyzeImage(fileBuffer) {
    const results = {
      lightingAnalysis: {},
      physicalCoherence: {},
      noisePatterns: {},
      artifactDetection: {},
      photographicProperties: {},
      overallAssessment: {
        suspicionScore: 0,
        findings: [],
        verdict: 'AUTHENTIC'
      }
    };

    try {
      const image = sharp(fileBuffer);
      const metadata = await image.metadata();
      const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });

      // 1. Lighting Analysis
      results.lightingAnalysis = await this.analyzeLighting(data, info);
      
      // 2. Physical Coherence
      results.physicalCoherence = await this.analyzePhysicalCoherence(data, info);
      
      // 3. Noise Patterns
      results.noisePatterns = await this.analyzeNoisePatterns(data, info);
      
      // 4. Artifact Detection
      results.artifactDetection = await this.detectArtifacts(fileBuffer, metadata);
      
      // 5. Photographic Properties
      results.photographicProperties = await this.analyzePhotographicProperties(data, info);
      
      // Calculate overall assessment
      results.overallAssessment = this.calculateOverallAssessment(results);

    } catch (error) {
      results.overallAssessment.findings.push(`Analysis error: ${error.message}`);
    }

    return results;
  }

  async analyzeLighting(data, info) {
    // ... (copiez le code corrigé de la réponse précédente)
    const { width, height, channels } = info;
    const gridSize = 4;
    const regionWidth = Math.floor(width / gridSize);
    const regionHeight = Math.floor(height / gridSize);
    
    const regions = [];
    let maxBrightness = 0;
    let minBrightness = 255;

    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        let totalBrightness = 0;
        let pixelCount = 0;

        for (let y = gy * regionHeight; y < (gy + 1) * regionHeight && y < height; y++) {
          for (let x = gx * regionWidth; x < (gx + 1) * regionWidth && x < width; x++) {
            const idx = (y * width + x) * channels;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += brightness;
            pixelCount++;
          }
        }

        const avgBrightness = totalBrightness / pixelCount;
        regions.push({ x: gx, y: gy, brightness: avgBrightness });
        
        maxBrightness = Math.max(maxBrightness, avgBrightness);
        minBrightness = Math.min(minBrightness, avgBrightness);
      }
    }

    const avgOverall = regions.reduce((sum, r) => sum + r.brightness, 0) / regions.length;
    const brightnessVariance = regions.reduce((sum, r) => 
      sum + Math.pow(r.brightness - avgOverall, 2), 0) / regions.length;

    const lightingRange = maxBrightness - minBrightness;
    const isInconsistent = lightingRange > 180 && brightnessVariance > 3500;

    return {
      consistent: !isInconsistent,
      brightnessRange: lightingRange.toFixed(2),
      variance: brightnessVariance.toFixed(2),
      averageBrightness: avgOverall.toFixed(2),
      assessment: isInconsistent 
        ? '⚠️ SUSPICIOUS: Significant lighting inconsistencies detected across regions'
        : '✅ PASS: Lighting appears consistent across the image',
      details: lightingRange > 180 && brightnessVariance > 3500
        ? 'Extreme brightness differences suggest possible composite or multiple light sources'
        : 'Normal lighting variation for natural photography'
    };
  }

  async analyzePhysicalCoherence(data, info) {
    const { width, height, channels } = info;
    const findings = [];
    let coherenceScore = 100;

    const gridSize = 3;
    const regionWidth = Math.floor(width / gridSize);
    const regionHeight = Math.floor(height / gridSize);
    const edgeDensities = [];

    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        let edgePixels = 0;
        let totalPixels = 0;

        for (let y = gy * regionHeight + 1; y < (gy + 1) * regionHeight - 1 && y < height - 1; y++) {
          for (let x = gx * regionWidth + 1; x < (gx + 1) * regionWidth - 1 && x < width - 1; x++) {
            const idx = (y * width + x) * channels;
            const currentBrightness = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            
            const rightIdx = (y * width + (x + 1)) * channels;
            const bottomIdx = ((y + 1) * width + x) * channels;
            const rightBrightness = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
            const bottomBrightness = 0.299 * data[bottomIdx] + 0.587 * data[bottomIdx + 1] + 0.114 * data[bottomIdx + 2];
            
            const edgeStrength = Math.abs(currentBrightness - rightBrightness) + 
                                Math.abs(currentBrightness - bottomBrightness);
            
            if (edgeStrength > 30) edgePixels++;
            totalPixels++;
          }
        }

        edgeDensities.push(edgePixels / totalPixels);
      }
    }

    const avgEdgeDensity = edgeDensities.reduce((a, b) => a + b, 0) / edgeDensities.length;
    const edgeVariance = edgeDensities.reduce((sum, d) => 
      sum + Math.pow(d - avgEdgeDensity, 2), 0) / edgeDensities.length;

    if (edgeVariance > 0.004) {
      findings.push('⚠️ Uneven edge density distribution - possible scale inconsistencies');
      coherenceScore -= 25;
    }

    const aspectRatio = width / height;
    if (aspectRatio < 0.2 || aspectRatio > 5) {
      findings.push('⚠️ Unusual aspect ratio - may indicate cropping or stretching');
      coherenceScore -= 15;
    }

    return {
      score: coherenceScore,
      edgeDensityVariance: edgeVariance.toFixed(6),
      aspectRatio: aspectRatio.toFixed(2),
      findings: findings.length > 0 ? findings : ['✅ Physical coherence appears normal'],
      assessment: coherenceScore > 70 ? 'PASS' : coherenceScore > 40 ? 'SUSPICIOUS' : 'FAIL'
    };
  }

  async analyzeNoisePatterns(data, info) {
    const { width, height, channels } = info;
    const gridSize = 5;
    const regionWidth = Math.floor(width / gridSize);
    const regionHeight = Math.floor(height / gridSize);
    
    const noiseVariances = [];

    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        const pixels = [];

        for (let y = gy * regionHeight; y < (gy + 1) * regionHeight && y < height; y++) {
          for (let x = gx * regionWidth; x < (gx + 1) * regionWidth && x < width; x++) {
            const idx = (y * width + x) * channels;
            const brightness = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            pixels.push(brightness);
          }
        }

        const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;
        const variance = pixels.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pixels.length;
        noiseVariances.push(variance);
      }
    }

    const avgNoise = noiseVariances.reduce((a, b) => a + b, 0) / noiseVariances.length;
    const noiseStdDev = Math.sqrt(
      noiseVariances.reduce((sum, v) => sum + Math.pow(v - avgNoise, 2), 0) / noiseVariances.length
    );

    const noiseInconsistency = noiseStdDev / (avgNoise + 1);
    const isInconsistent = noiseInconsistency > 0.8;

    return {
      consistent: !isInconsistent,
      averageNoise: avgNoise.toFixed(2),
      noiseDeviation: noiseStdDev.toFixed(2),
      inconsistencyRatio: noiseInconsistency.toFixed(3),
      assessment: isInconsistent
        ? '⚠️ SUSPICIOUS: Irregular noise distribution - regions may be from different sources'
        : '✅ PASS: Noise pattern appears uniform across image',
      details: isInconsistent
        ? 'Different noise levels suggest splicing from multiple images'
        : 'Consistent grain structure indicates single source'
    };
  }

  async detectArtifacts(fileBuffer, metadata) {
    const findings = [];
    let artifactScore = 0;

    if (metadata.format === 'jpeg') {
      const image = sharp(fileBuffer);
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
      
      let blockBoundaryAnomalies = 0;
      const { width, height, channels } = info;
      
      for (let y = 8; y < height; y += 8) {
        for (let x = 0; x < width - 1; x++) {
          const idx = (y * width + x) * channels;
          const aboveIdx = ((y - 1) * width + x) * channels;
          
          const currentBrightness = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          const aboveBrightness = 0.299 * data[aboveIdx] + 0.587 * data[aboveIdx + 1] + 0.114 * data[aboveIdx + 2];
          
          if (Math.abs(currentBrightness - aboveBrightness) > 20) {
            blockBoundaryAnomalies++;
          }
        }
      }
      
      const anomalyRate = blockBoundaryAnomalies / (height / 8 * width);
      
      if (anomalyRate > 8) {
        findings.push('⚠️ Significant JPEG compression artifacts detected');
        artifactScore += 30;
      } else if (anomalyRate > 4) {
        findings.push('ℹ️ Moderate compression artifacts present (normal for JPEG)');
        artifactScore += 10;
      }
    }

    const image = sharp(fileBuffer);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    let chromaticAberrations = 0;
    
    for (let y = 0; y < info.height; y += 10) {
      for (let x = 0; x < info.width - 1; x += 10) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        if (maxDiff > 120) {
          chromaticAberrations++;
        }
      }
    }
    
    const aberrationRate = chromaticAberrations / ((info.width / 10) * (info.height / 10));
    if (aberrationRate > 0.15) {
      findings.push('⚠️ Chromatic aberration patterns detected');
      artifactScore += 20;
    }

    return {
      score: artifactScore,
      findings: findings.length > 0 ? findings : ['✅ No significant artifacts detected'],
      assessment: artifactScore < 25 ? 'PASS' : artifactScore < 50 ? 'SUSPICIOUS' : 'FAIL',
      details: {
        compressionArtifacts: artifactScore >= 20,
        chromaticAberration: aberrationRate > 0.15
      }
    };
  }

  async analyzePhotographicProperties(data, info) {
    const { width, height, channels } = info;
    const findings = [];
    
    const gridSize = 4;
    const regionWidth = Math.floor(width / gridSize);
    const regionHeight = Math.floor(height / gridSize);
    const sharpnessValues = [];

    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        let edgeStrength = 0;
        let pixelCount = 0;

        for (let y = gy * regionHeight + 1; y < (gy + 1) * regionHeight - 1 && y < height - 1; y++) {
          for (let x = gx * regionWidth + 1; x < (gx + 1) * regionWidth - 1 && x < width - 1; x++) {
            const idx = (y * width + x) * channels;
            const current = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            
            const rightIdx = (y * width + (x + 1)) * channels;
            const bottomIdx = ((y + 1) * width + x) * channels;
            const right = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
            const bottom = 0.299 * data[bottomIdx] + 0.587 * data[bottomIdx + 1] + 0.114 * data[bottomIdx + 2];
            
            edgeStrength += Math.abs(current - right) + Math.abs(current - bottom);
            pixelCount++;
          }
        }

        sharpnessValues.push(edgeStrength / pixelCount);
      }
    }

    const avgSharpness = sharpnessValues.reduce((a, b) => a + b, 0) / sharpnessValues.length;
    const sharpnessVariance = sharpnessValues.reduce((sum, s) => 
      sum + Math.pow(s - avgSharpness, 2), 0) / sharpnessValues.length;

    const sharpnessInconsistency = Math.sqrt(sharpnessVariance) / (avgSharpness + 1);

    if (sharpnessInconsistency > 0.6) {
      findings.push('⚠️ Inconsistent sharpness/focus - possible composite from multiple images');
    }

    if (avgSharpness < 3) {
      findings.push('ℹ️ Image appears heavily blurred or low quality');
    } else if (avgSharpness > 40) {
      findings.push('ℹ️ High sharpness detected - possibly over-sharpened');
    }

    return {
      averageSharpness: avgSharpness.toFixed(2),
      sharpnessVariance: sharpnessVariance.toFixed(2),
      inconsistencyRatio: sharpnessInconsistency.toFixed(3),
      findings: findings.length > 0 ? findings : ['✅ Focus consistency appears normal'],
      assessment: sharpnessInconsistency < 0.6 ? 'PASS' : 'SUSPICIOUS'
    };
  }

  calculateOverallAssessment(results) {
    let suspicionScore = 0;
    const findings = [];

    if (!results.lightingAnalysis.consistent) {
      suspicionScore += 30;
      findings.push(results.lightingAnalysis.assessment);
    }

    if (results.physicalCoherence.score < 70) {
      suspicionScore += 15;
      findings.push(...results.physicalCoherence.findings.filter(f => f.includes('⚠️')));
    }

    if (!results.noisePatterns.consistent) {
      suspicionScore += 25;
      findings.push(results.noisePatterns.assessment);
    }

    if (results.artifactDetection.score > 25) {
      suspicionScore += results.artifactDetection.score;
      findings.push(...results.artifactDetection.findings.filter(f => f.includes('⚠️')));
    }

    if (results.photographicProperties.inconsistencyRatio > 0.6) {
      suspicionScore += 20;
      findings.push(...results.photographicProperties.findings.filter(f => f.includes('⚠️')));
    }

    let verdict;
    if (suspicionScore < 40) {
      verdict = 'AUTHENTIC';
    } else if (suspicionScore < 70) {
      verdict = 'SUSPICIOUS';
    } else {
      verdict = 'LIKELY_MANIPULATED';
    }

    return {
      suspicionScore: Math.min(100, suspicionScore),
      verdict,
      findings: findings.length > 0 ? findings : ['✅ All visual forensics checks passed'],
      confidence: Math.max(0, 100 - suspicionScore),
      explanation: this.getVerdictExplanation(verdict, suspicionScore)
    };
  }

  getVerdictExplanation(verdict, score) {
    if (verdict === 'AUTHENTIC') {
      return 'Visual forensics analysis shows consistent lighting, noise, and photographic properties. No significant manipulation indicators detected.';
    } else if (verdict === 'SUSPICIOUS') {
      return `Moderate inconsistencies detected (score: ${score}). Manual inspection recommended to verify authenticity.`;
    } else {
      return `Multiple manipulation indicators detected (score: ${score}). Image likely contains edited or composite elements.`;
    }
  }
}

// IMPORTANT: Cette ligne doit être à la fin du fichier
module.exports = VisualContentAnalysisService;
