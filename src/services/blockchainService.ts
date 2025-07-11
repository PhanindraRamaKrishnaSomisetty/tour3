// Blockchain service for secure payment and host registration storage
export interface BlockchainTransaction {
  hash: string;
  timestamp: number;
  type: 'payment' | 'registration' | 'verification';
  data: any;
  signature: string;
  previousHash: string;
}

export interface HostRegistration {
  id: string;
  hostData: {
    personalInfo: any;
    propertyInfo: any;
    culturalOfferings: any;
    verification: any;
  };
  timestamp: number;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  verificationHash: string;
  ipfsHash?: string; // For storing documents
}

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: 'INR' | 'ETH' | 'BTC';
  fromAddress: string;
  toAddress: string;
  stakeholderDistribution: {
    stakeholderId: string;
    amount: number;
    walletAddress: string;
  }[];
  timestamp: number;
  confirmations: number;
  gasUsed?: number;
  transactionFee: number;
}

class BlockchainService {
  private chain: BlockchainTransaction[] = [];
  private pendingTransactions: BlockchainTransaction[] = [];
  private miningReward = 100;

  constructor() {
    this.createGenesisBlock();
  }

  private createGenesisBlock(): void {
    const genesisBlock: BlockchainTransaction = {
      hash: this.calculateHash('0', Date.now(), 'genesis', {}, ''),
      timestamp: Date.now(),
      type: 'payment',
      data: { message: 'VillageStay Genesis Block' },
      signature: 'genesis_signature',
      previousHash: '0'
    };
    this.chain.push(genesisBlock);
  }

  private calculateHash(previousHash: string, timestamp: number, type: string, data: any, signature: string): string {
    const dataString = JSON.stringify({ previousHash, timestamp, type, data, signature });
    // Simple hash function (in production, use SHA-256)
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private getLatestBlock(): BlockchainTransaction {
    return this.chain[this.chain.length - 1];
  }

  // Store payment transaction on blockchain
  async storePaymentTransaction(paymentData: PaymentRecord): Promise<string> {
    const transaction: BlockchainTransaction = {
      hash: '',
      timestamp: Date.now(),
      type: 'payment',
      data: paymentData,
      signature: this.generateSignature(paymentData),
      previousHash: this.getLatestBlock().hash
    };

    transaction.hash = this.calculateHash(
      transaction.previousHash,
      transaction.timestamp,
      transaction.type,
      transaction.data,
      transaction.signature
    );

    this.pendingTransactions.push(transaction);
    await this.mineBlock();
    
    return transaction.hash;
  }

  // Store host registration on blockchain
  async storeHostRegistration(hostData: HostRegistration): Promise<string> {
    const transaction: BlockchainTransaction = {
      hash: '',
      timestamp: Date.now(),
      type: 'registration',
      data: hostData,
      signature: this.generateSignature(hostData),
      previousHash: this.getLatestBlock().hash
    };

    transaction.hash = this.calculateHash(
      transaction.previousHash,
      transaction.timestamp,
      transaction.type,
      transaction.data,
      transaction.signature
    );

    this.pendingTransactions.push(transaction);
    await this.mineBlock();
    
    return transaction.hash;
  }

  // Verify host registration
  async verifyHostRegistration(registrationId: string, verificationData: any): Promise<string> {
    const transaction: BlockchainTransaction = {
      hash: '',
      timestamp: Date.now(),
      type: 'verification',
      data: {
        registrationId,
        verificationData,
        verifiedBy: 'VillageStay_Admin',
        status: 'verified'
      },
      signature: this.generateSignature({ registrationId, verificationData }),
      previousHash: this.getLatestBlock().hash
    };

    transaction.hash = this.calculateHash(
      transaction.previousHash,
      transaction.timestamp,
      transaction.type,
      transaction.data,
      transaction.signature
    );

    this.pendingTransactions.push(transaction);
    await this.mineBlock();
    
    return transaction.hash;
  }

  private generateSignature(data: any): string {
    // Simple signature generation (in production, use proper cryptographic signatures)
    const dataString = JSON.stringify(data);
    return 'sig_' + this.calculateHash('', Date.now(), 'signature', dataString, '');
  }

  private async mineBlock(): Promise<void> {
    // Simulate mining process
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.pendingTransactions.length > 0) {
          const block = this.pendingTransactions.shift()!;
          this.chain.push(block);
        }
        resolve();
      }, 1000); // Simulate 1 second mining time
    });
  }

  // Get transaction by hash
  getTransaction(hash: string): BlockchainTransaction | null {
    return this.chain.find(block => block.hash === hash) || null;
  }

  // Get all transactions for a specific address/user
  getTransactionsByAddress(address: string): BlockchainTransaction[] {
    return this.chain.filter(block => {
      if (block.type === 'payment') {
        const paymentData = block.data as PaymentRecord;
        return paymentData.fromAddress === address || 
               paymentData.toAddress === address ||
               paymentData.stakeholderDistribution.some(s => s.walletAddress === address);
      }
      return false;
    });
  }

  // Get host registration by ID
  getHostRegistration(registrationId: string): BlockchainTransaction | null {
    return this.chain.find(block => 
      block.type === 'registration' && 
      block.data.id === registrationId
    ) || null;
  }

  // Validate blockchain integrity
  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      const recalculatedHash = this.calculateHash(
        currentBlock.previousHash,
        currentBlock.timestamp,
        currentBlock.type,
        currentBlock.data,
        currentBlock.signature
      );

      if (currentBlock.hash !== recalculatedHash) {
        return false;
      }
    }
    return true;
  }

  // Get blockchain statistics
  getBlockchainStats() {
    const totalBlocks = this.chain.length;
    const totalPayments = this.chain.filter(b => b.type === 'payment').length;
    const totalRegistrations = this.chain.filter(b => b.type === 'registration').length;
    const totalVerifications = this.chain.filter(b => b.type === 'verification').length;

    const totalValue = this.chain
      .filter(b => b.type === 'payment')
      .reduce((sum, b) => sum + (b.data as PaymentRecord).amount, 0);

    return {
      totalBlocks,
      totalPayments,
      totalRegistrations,
      totalVerifications,
      totalValue,
      isValid: this.isChainValid(),
      latestBlockHash: this.getLatestBlock().hash
    };
  }

  // Export blockchain data
  exportBlockchain(): string {
    return JSON.stringify(this.chain, null, 2);
  }

  // Import blockchain data
  importBlockchain(chainData: string): boolean {
    try {
      const importedChain = JSON.parse(chainData);
      this.chain = importedChain;
      return this.isChainValid();
    } catch (error) {
      console.error('Failed to import blockchain:', error);
      return false;
    }
  }
}

// Singleton instance
export const blockchainService = new BlockchainService();

// Utility functions for crypto wallet integration
export const generateWalletAddress = (): string => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

export const validateWalletAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Smart contract simulation for automatic payments
export class PaymentSmartContract {
  private contractAddress: string;
  private stakeholderRules: { [key: string]: number } = {};

  constructor() {
    this.contractAddress = generateWalletAddress();
  }

  setStakeholderRules(rules: { [key: string]: number }): void {
    this.stakeholderRules = rules;
  }

  async executePayment(totalAmount: number, stakeholders: any[]): Promise<PaymentRecord> {
    const paymentRecord: PaymentRecord = {
      id: 'payment_' + Date.now(),
      amount: totalAmount,
      currency: 'INR',
      fromAddress: generateWalletAddress(),
      toAddress: this.contractAddress,
      stakeholderDistribution: stakeholders.map(stakeholder => ({
        stakeholderId: stakeholder.id,
        amount: Math.round(totalAmount * stakeholder.percentage / 100),
        walletAddress: generateWalletAddress()
      })),
      timestamp: Date.now(),
      confirmations: 6,
      transactionFee: Math.round(totalAmount * 0.01), // 1% transaction fee
    };

    // Store on blockchain
    await blockchainService.storePaymentTransaction(paymentRecord);
    
    return paymentRecord;
  }

  getContractAddress(): string {
    return this.contractAddress;
  }
}

export const paymentContract = new PaymentSmartContract();