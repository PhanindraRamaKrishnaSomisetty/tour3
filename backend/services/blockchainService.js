const Web3 = require('web3');
const { dbHelpers, COLLECTIONS } = require('../config/dbConfig');

class BlockchainService {
  constructor() {
    this.web3 = new Web3(process.env.ETHEREUM_RPC_URL || 'https://polygon-rpc.com');
    this.contractAddress = process.env.BOOKING_CONTRACT_ADDRESS;
    this.privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    this.account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
    this.web3.eth.accounts.wallet.add(this.account);
    
    // Minimal ABI for gas optimization
    this.contractABI = [
      {
        "inputs": [{"type": "string"}, {"type": "string"}, {"type": "uint256"}],
        "name": "logBooking",
        "outputs": [],
        "type": "function"
      },
      {
        "inputs": [{"type": "string"}, {"type": "uint8"}, {"type": "string"}],
        "name": "logRating",
        "outputs": [],
        "type": "function"
      },
      {
        "inputs": [{"type": "string"}],
        "name": "getBooking",
        "outputs": [{"type": "string"}, {"type": "uint256"}, {"type": "bool"}],
        "type": "function",
        "stateMutability": "view"
      }
    ];
    
    this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
  }

  // Log booking on blockchain with minimal gas
  async logBooking(bookingId, ipfsHash, amount) {
    try {
      const gasPrice = await this.getOptimalGasPrice();
      const gasEstimate = await this.contract.methods
        .logBooking(bookingId, ipfsHash, amount)
        .estimateGas({ from: this.account.address });

      const tx = await this.contract.methods
        .logBooking(bookingId, ipfsHash, amount)
        .send({
          from: this.account.address,
          gas: Math.floor(gasEstimate * 1.1),
          gasPrice
        });

      // Store transaction hash in Firestore
      await dbHelpers.batchWrite([{
        type: 'set',
        ref: require('../config/dbConfig').initializeFirebase()
          .collection(COLLECTIONS.TRANSACTIONS).doc(bookingId),
        data: {
          bookingId,
          txHash: tx.transactionHash,
          blockNumber: tx.blockNumber,
          ipfsHash,
          amount,
          timestamp: new Date(),
          type: 'booking'
        }
      }]);

      return {
        success: true,
        txHash: tx.transactionHash,
        blockNumber: tx.blockNumber
      };
    } catch (error) {
      console.error('Blockchain booking error:', error);
      throw new Error('Blockchain logging failed');
    }
  }

  // Log rating/review on blockchain
  async logRating(bookingId, rating, reviewHash) {
    try {
      const gasPrice = await this.getOptimalGasPrice();
      const gasEstimate = await this.contract.methods
        .logRating(bookingId, rating, reviewHash)
        .estimateGas({ from: this.account.address });

      const tx = await this.contract.methods
        .logRating(bookingId, rating, reviewHash)
        .send({
          from: this.account.address,
          gas: Math.floor(gasEstimate * 1.1),
          gasPrice
        });

      // Store in Firestore
      await dbHelpers.batchWrite([{
        type: 'set',
        ref: require('../config/dbConfig').initializeFirebase()
          .collection(COLLECTIONS.TRANSACTIONS).doc(`${bookingId}_rating`),
        data: {
          bookingId,
          txHash: tx.transactionHash,
          rating,
          reviewHash,
          timestamp: new Date(),
          type: 'rating'
        }
      }]);

      return {
        success: true,
        txHash: tx.transactionHash
      };
    } catch (error) {
      console.error('Blockchain rating error:', error);
      throw new Error('Rating logging failed');
    }
  }

  // Verify booking integrity
  async verifyBooking(bookingId) {
    try {
      const result = await this.contract.methods
        .getBooking(bookingId)
        .call();

      return {
        exists: result[2],
        ipfsHash: result[0],
        amount: result[1],
        verified: true
      };
    } catch (error) {
      console.error('Verification error:', error);
      return { verified: false, error: error.message };
    }
  }

  // Get optimal gas price for cost efficiency
  async getOptimalGasPrice() {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      // Use 90% of current gas price for cost optimization
      return Math.floor(gasPrice * 0.9);
    } catch (error) {
      // Fallback gas price (20 gwei)
      return this.web3.utils.toWei('20', 'gwei');
    }
  }

  // Batch multiple operations for gas efficiency
  async batchOperations(operations) {
    try {
      const batch = new this.web3.BatchRequest();
      const promises = [];

      operations.forEach(op => {
        const promise = new Promise((resolve, reject) => {
          const request = this.contract.methods[op.method](...op.params)
            .send.request({
              from: this.account.address,
              gas: op.gas,
              gasPrice: op.gasPrice
            }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
          batch.add(request);
        });
        promises.push(promise);
      });

      batch.execute();
      return await Promise.all(promises);
    } catch (error) {
      console.error('Batch operation error:', error);
      throw new Error('Batch blockchain operation failed');
    }
  }
}

module.exports = new BlockchainService();