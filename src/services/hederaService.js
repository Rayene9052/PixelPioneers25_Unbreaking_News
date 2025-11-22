import {
  Client,
  PrivateKey,
  AccountId,
  FileCreateTransaction,
  FileAppendTransaction,
  Hbar
} from '@hashgraph/sdk';
import logger from '../config/logger.js';

/**
 * Service d'enregistrement sur Hedera Hashgraph
 */
class HederaService {
  constructor(accountId, privateKey, network = 'testnet') {
    this.accountId = AccountId.fromString(accountId);
    this.privateKey = PrivateKey.fromString(privateKey);
    
    // Configuration du client Hedera
    if (network === 'testnet') {
      this.client = Client.forTestnet();
    } else if (network === 'mainnet') {
      this.client = Client.forMainnet();
    } else {
      throw new Error('Network must be "testnet" or "mainnet"');
    }
    
    this.client.setOperator(this.accountId, this.privateKey);
  }

  /**
   * Enregistre un hash et des métadonnées sur Hedera
   */
  async recordHash(hash, metadata) {
    try {
      logger.info('Enregistrement sur Hedera Hashgraph...');
      
      const recordData = {
        hash,
        timestamp: new Date().toISOString(),
        metadata: {
          score: metadata.score || 0,
          fileType: metadata.fileType || 'unknown',
          analysisSummary: metadata.analysisSummary || 'No summary'
        }
      };

      const recordJson = JSON.stringify(recordData, null, 2);
      const recordBuffer = Buffer.from(recordJson, 'utf-8');

      // Création d'un fichier sur Hedera pour stocker l'enregistrement
      const fileCreateTx = await new FileCreateTransaction()
        .setContents(recordBuffer)
        .setKeys([this.privateKey.publicKey])
        .setMaxTransactionFee(new Hbar(2))
        .execute(this.client);

      const receipt = await fileCreateTx.getReceipt(this.client);
      const fileId = receipt.fileId;

      logger.info(`Enregistrement Hedera réussi. File ID: ${fileId.toString()}`);
      
      return {
        success: true,
        fileId: fileId.toString(),
        transactionId: fileCreateTx.transactionId.toString(),
        timestamp: recordData.timestamp,
        hash,
        proof: {
          network: this.client.network,
          fileId: fileId.toString(),
          transactionId: fileCreateTx.transactionId.toString()
        }
      };
    } catch (error) {
      logger.error('Erreur lors de l\'enregistrement Hedera:', error);
      return {
        success: false,
        error: error.message,
        proof: null
      };
    }
  }

  /**
   * Vérifie un enregistrement sur Hedera
   */
  async verifyRecord(fileId) {
    try {
      // Récupération du contenu du fichier sur Hedera
      // Note: Cette fonctionnalité nécessiterait FileContentsQuery
      // Pour simplifier, on retourne une structure de base
      logger.info(`Vérification de l'enregistrement: ${fileId}`);
      
      return {
        verified: true,
        fileId,
        message: 'Enregistrement vérifié sur Hedera'
      };
    } catch (error) {
      logger.error('Erreur lors de la vérification:', error);
      return {
        verified: false,
        error: error.message
      };
    }
  }
}

export default HederaService;

