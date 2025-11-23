#!/bin/bash

# Script de test du backend PixelPioneers
# Ce script teste tous les endpoints sans nécessiter Hedera

echo "🧪 Tests du Backend PixelPioneers"
echo "=================================="
echo ""

# Variables
BASE_URL="http://localhost:3000"
API_URL="${BASE_URL}/api"

# Couleurs pour l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester un endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -e "${YELLOW}Test: ${name}${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" $data)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ Succès (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Erreur (HTTP $http_code)${NC}"
        echo "$body"
    fi
    echo ""
}

# 1. Test de santé du serveur
echo "1️⃣  Test de santé du serveur"
test_endpoint "Health Check" "GET" "${API_URL}/health"

# 2. Test de la route racine
echo "2️⃣  Test de la route racine"
test_endpoint "Root Endpoint" "GET" "${BASE_URL}/"

# 3. Test upload d'image (nécessite un fichier image)
echo "3️⃣  Test upload d'image"
if [ -f "test_image.jpg" ]; then
    test_endpoint "Upload Image" "POST" "${API_URL}/upload-image" "-F image=@test_image.jpg"
else
    echo -e "${YELLOW}⚠ Fichier test_image.jpg non trouvé - création d'une image de test${NC}"
    # Créer une image de test simple avec ImageMagick ou utiliser une image existante
    echo -e "${RED}✗ Veuillez créer un fichier test_image.jpg pour tester l'upload${NC}"
fi
echo ""

# 4. Test upload de PDF (nécessite un fichier PDF)
echo "4️⃣  Test upload de PDF"
if [ -f "test_document.pdf" ]; then
    test_endpoint "Upload PDF" "POST" "${API_URL}/upload-pdf" "-F pdf=@test_document.pdf"
else
    echo -e "${YELLOW}⚠ Fichier test_document.pdf non trouvé${NC}"
    echo -e "${RED}✗ Veuillez créer un fichier test_document.pdf pour tester l'upload${NC}"
fi
echo ""

# 5. Test upload de vidéo (nécessite un fichier vidéo)
echo "5️⃣  Test upload de vidéo"
if [ -f "test_video.mp4" ]; then
    test_endpoint "Upload Video" "POST" "${API_URL}/upload-video" "-F video=@test_video.mp4"
else
    echo -e "${YELLOW}⚠ Fichier test_video.mp4 non trouvé${NC}"
    echo -e "${RED}✗ Veuillez créer un fichier test_video.mp4 pour tester l'upload${NC}"
fi
echo ""

echo "=================================="
echo "✅ Tests terminés"
echo ""
echo "Note: Les tests d'upload nécessitent des fichiers de test."
echo "Créez des fichiers test_image.jpg, test_document.pdf, ou test_video.mp4 pour tester les uploads."

