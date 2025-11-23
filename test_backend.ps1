# Script de test du backend PixelPioneers pour PowerShell
# Ce script teste tous les endpoints sans nécessiter Hedera

Write-Host "🧪 Tests du Backend PixelPioneers" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$BASE_URL = "http://localhost:3000"
$API_URL = "$BASE_URL/api"

# Fonction pour tester un endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Data = $null
    )
    
    Write-Host "Test: $Name" -ForegroundColor Yellow
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Url -Method $Method
            Write-Host "✓ Succès" -ForegroundColor Green
            $response | ConvertTo-Json -Depth 10
        } else {
            if ($Data) {
                $response = Invoke-RestMethod -Uri $Url -Method $Method -Form $Data
                Write-Host "✓ Succès" -ForegroundColor Green
                $response | ConvertTo-Json -Depth 10
            } else {
                $response = Invoke-RestMethod -Uri $Url -Method $Method
                Write-Host "✓ Succès" -ForegroundColor Green
                $response | ConvertTo-Json -Depth 10
            }
        }
    } catch {
        Write-Host "✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host $_.ErrorDetails.Message
        }
    }
    Write-Host ""
}

# 1. Test de santé du serveur
Write-Host "1️⃣  Test de santé du serveur" -ForegroundColor Cyan
Test-Endpoint -Name "Health Check" -Method "GET" -Url "$API_URL/health"

# 2. Test de la route racine
Write-Host "2️⃣  Test de la route racine" -ForegroundColor Cyan
Test-Endpoint -Name "Root Endpoint" -Method "GET" -Url "$BASE_URL/"

# 3. Test upload d'image
Write-Host "3️⃣  Test upload d'image" -ForegroundColor Cyan
$testImage = Get-ChildItem -Path . -Filter "*.jpg" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($testImage) {
    Write-Host "Utilisation de: $($testImage.Name)" -ForegroundColor Gray
    $formData = @{
        image = $testImage
    }
    Test-Endpoint -Name "Upload Image" -Method "POST" -Url "$API_URL/upload-image" -Data $formData
} else {
    Write-Host "⚠ Aucun fichier .jpg trouvé dans le répertoire courant" -ForegroundColor Yellow
    Write-Host "✗ Placez un fichier image .jpg dans le dossier pour tester l'upload" -ForegroundColor Red
    Write-Host ""
}

# 4. Test upload de PDF
Write-Host "4️⃣  Test upload de PDF" -ForegroundColor Cyan
$testPdf = Get-ChildItem -Path . -Filter "*.pdf" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($testPdf) {
    Write-Host "Utilisation de: $($testPdf.Name)" -ForegroundColor Gray
    $formData = @{
        pdf = $testPdf
    }
    Test-Endpoint -Name "Upload PDF" -Method "POST" -Url "$API_URL/upload-pdf" -Data $formData
} else {
    Write-Host "⚠ Aucun fichier .pdf trouvé dans le répertoire courant" -ForegroundColor Yellow
    Write-Host "✗ Placez un fichier PDF dans le dossier pour tester l'upload" -ForegroundColor Red
    Write-Host ""
}

# 5. Test upload de vidéo
Write-Host "5️⃣  Test upload de vidéo" -ForegroundColor Cyan
$testVideo = Get-ChildItem -Path . -Filter "*.mp4" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($testVideo) {
    Write-Host "Utilisation de: $($testVideo.Name)" -ForegroundColor Gray
    $formData = @{
        video = $testVideo
    }
    Test-Endpoint -Name "Upload Video" -Method "POST" -Url "$API_URL/upload-video" -Data $formData
} else {
    Write-Host "⚠ Aucun fichier .mp4 trouvé dans le répertoire courant" -ForegroundColor Yellow
    Write-Host "✗ Placez un fichier vidéo .mp4 dans le dossier pour tester l'upload" -ForegroundColor Red
    Write-Host ""
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Tests terminés" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Les tests d'upload nécessitent des fichiers de test." -ForegroundColor Yellow
Write-Host "Créez des fichiers test_image.jpg, test_document.pdf, ou test_video.mp4 pour tester les uploads." -ForegroundColor Yellow



