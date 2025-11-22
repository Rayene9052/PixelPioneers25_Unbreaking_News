# Configuration des Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Hive AI API Key
# Obtenez votre clé sur https://thehive.ai/
HIVE_API_KEY=your_hive_api_key_here

# SerpAPI Key
# Obtenez votre clé sur https://serpapi.com/
SERPAPI_KEY=your_serpapi_key_here

# OpenAI API Key
# Obtenez votre clé sur https://platform.openai.com/
OPENAI_API_KEY=your_openai_api_key_here

# Hedera Configuration
# Créez un compte sur https://portal.hedera.com/
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet

# File Upload Configuration
MAX_FILE_SIZE=100000000
UPLOAD_DIR=./uploads
```

## Obtention des Clés API

### Hive AI
1. Visitez https://thehive.ai/
2. Créez un compte
3. Obtenez votre clé API depuis le dashboard

### SerpAPI
1. Visitez https://serpapi.com/
2. Créez un compte (plan gratuit disponible)
3. Copiez votre clé API depuis le dashboard

### OpenAI
1. Visitez https://platform.openai.com/
2. Créez un compte
3. Générez une clé API dans la section API Keys
4. Assurez-vous d'avoir des crédits disponibles

### Hedera Hashgraph
1. Visitez https://portal.hedera.com/
2. Créez un compte testnet (gratuit)
3. Créez un compte et récupérez :
   - Account ID (format: 0.0.xxxxxx)
   - Private Key (format hex)
4. Pour testnet, utilisez `HEDERA_NETWORK=testnet`
5. Pour mainnet, utilisez `HEDERA_NETWORK=mainnet` (nécessite des HBAR)

## Notes Importantes

- **Ne commitez jamais le fichier `.env`** dans Git
- Le fichier `.env` est déjà dans `.gitignore`
- Pour la production, utilisez des variables d'environnement système ou un gestionnaire de secrets
- Les clés API ont des limites de taux - consultez la documentation de chaque service

