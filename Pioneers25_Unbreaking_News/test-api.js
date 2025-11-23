/**
 * Script de test manuel pour l'API Histified
 */
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8003';
const PORT = 8003;

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

// Test 1: Health Check
async function testHealthCheck() {
  logSection('Test 1: Health Check');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    log(`✅ Status: ${response.status}`, 'green');
    log(`Response: ${JSON.stringify(data, null, 2)}`, 'blue');
    return response.status === 200;
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

// Test 2: Root endpoint
async function testRoot() {
  logSection('Test 2: Root Endpoint');
  try {
    const response = await fetch(`${BASE_URL}/`);
    const data = await response.json();
    log(`✅ Status: ${response.status}`, 'green');
    log(`Response: ${JSON.stringify(data, null, 2)}`, 'blue');
    return response.status === 200;
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return false;
  }
}

// Test 3: Upload d'image
async function testUploadImage() {
  logSection('Test 3: Upload d\'image');
  try {
    // Créer une image de test simple avec sharp
    const sharp = require('sharp');
    const testImagePath = path.join(__dirname, 'test_image.jpg');
    
    // Créer une image de test
    await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .jpeg()
    .toFile(testImagePath);

    // Upload l'image
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath), {
      filename: 'test_image.jpg',
      contentType: 'image/jpeg'
    });

    const response = await fetch(`${BASE_URL}/api/v1/content/upload`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const data = await response.json();
    
    if (response.status === 200) {
      log(`✅ Upload réussi!`, 'green');
      log(`Content ID: ${data.content_id}`, 'blue');
      log(`Type: ${data.content_type}`, 'blue');
      
      // Nettoyer
      fs.unlinkSync(testImagePath);
      
      return data.content_id;
    } else {
      log(`❌ Erreur upload: ${response.status}`, 'red');
      log(`Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
      return null;
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return null;
  }
}

// Test 4: Analyser un contenu
async function testAnalyze(contentId) {
  logSection('Test 4: Analyser un contenu');
  if (!contentId) {
    log('⚠️  Pas de content_id, test ignoré', 'yellow');
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/content/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content_id: contentId })
    });

    const data = await response.json();
    
    if (response.status === 200) {
      log(`✅ Analyse complétée!`, 'green');
      log(`Analysis ID: ${data.analysis_id}`, 'blue');
      if (data.summary) {
        log(`\n📊 Résumé:`, 'cyan');
        log(`  - Credibility Score: ${data.summary.credibility_score}`, 'blue');
        log(`  - Manipulation Probability: ${data.summary.manipulation_probability}`, 'blue');
        log(`  - AI Detection Score: ${data.summary.ai_detection_score}`, 'blue');
      }
      return data.analysis_id;
    } else {
      log(`❌ Erreur analyse: ${response.status}`, 'red');
      log(`Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
      return null;
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return null;
  }
}

// Test 5: Récupérer un contenu
async function testGetContent(contentId) {
  logSection('Test 5: Récupérer un contenu');
  if (!contentId) {
    log('⚠️  Pas de content_id, test ignoré', 'yellow');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/content/${contentId}`);
    const data = await response.json();
    
    if (response.status === 200) {
      log(`✅ Contenu récupéré!`, 'green');
      log(`Response: ${JSON.stringify(data, null, 2)}`, 'blue');
    } else {
      log(`❌ Erreur: ${response.status}`, 'red');
      log(`Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

// Test 6: Générer un rapport
async function testGenerateReport(contentId) {
  logSection('Test 6: Générer un rapport');
  if (!contentId) {
    log('⚠️  Pas de content_id, test ignoré', 'yellow');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/reports/content/${contentId}`);
    const data = await response.json();
    
    if (response.status === 200) {
      log(`✅ Rapport généré!`, 'green');
      log(`Report ID: ${data.report_id}`, 'blue');
      if (data.analysis_summary) {
        log(`\n📊 Résumé d'analyse:`, 'cyan');
        log(`  - Credibility Score: ${data.analysis_summary.credibility_score}`, 'blue');
        log(`  - Manipulation Probability: ${data.analysis_summary.manipulation_probability}`, 'blue');
      }
      if (data.credibility_assessment) {
        log(`\n🎯 Évaluation:`, 'cyan');
        log(`  - Risk Level: ${data.credibility_assessment.risk_level}`, 'blue');
        log(`  - Recommendations:`, 'blue');
        data.credibility_assessment.recommendations.forEach(rec => {
          log(`    • ${rec}`, 'yellow');
        });
      }
    } else {
      log(`❌ Erreur: ${response.status}`, 'red');
      log(`Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

// Test 7: Créer une archive
async function testCreateArchive() {
  logSection('Test 7: Créer une archive');
  try {
    const response = await fetch(`${BASE_URL}/api/v1/archives/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Archive',
        description: 'Archive de test pour Histified',
        source: 'Test Source'
      })
    });

    const data = await response.json();
    
    if (response.status === 200) {
      log(`✅ Archive créée!`, 'green');
      log(`Archive ID: ${data.id}`, 'blue');
      log(`Name: ${data.name}`, 'blue');
      return data.id;
    } else {
      log(`❌ Erreur: ${response.status}`, 'red');
      log(`Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
      return null;
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return null;
  }
}

// Fonction principale
async function runTests() {
  console.clear();
  log('\n🚀 Histified Backend - Tests API', 'cyan');
  log(`📍 Port: ${PORT}`, 'blue');
  log(`🌐 Base URL: ${BASE_URL}\n`, 'blue');

  // Vérifier que le serveur est démarré
  const serverRunning = await testHealthCheck();
  if (!serverRunning) {
    log('\n❌ Le serveur ne répond pas!', 'red');
    log('💡 Assurez-vous que le serveur est démarré avec: npm start ou npm run dev', 'yellow');
    process.exit(1);
  }

  // Tests de base
  await testRoot();

  // Tests de contenu
  const contentId = await testUploadImage();
  if (contentId) {
    await testGetContent(contentId);
    const analysisId = await testAnalyze(contentId);
    if (analysisId) {
      await testGenerateReport(contentId);
    }
  }

  // Tests d'archives
  await testCreateArchive();

  logSection('✅ Tous les tests terminés!');
  log('\n💡 Pour plus de tests, utilisez:', 'yellow');
  log('   - curl (voir TESTING.md)', 'blue');
  log('   - Postman', 'blue');
  log('   - Swagger UI (si configuré)', 'blue');
}

// Exécuter les tests
runTests().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  process.exit(1);
});

