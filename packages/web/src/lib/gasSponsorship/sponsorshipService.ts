import { ethers } from 'ethers';

export interface SponsoredTransaction {
  to: string;
  data: string;
  value?: string;
  gasLimit?: string;
}

export interface SponsorshipResult {
  transactionHash: string;
  gasUsed: string;
  gasCost: string;
  sponsored: boolean;
}

/**
 * Gas Sponsorship Service
 * 
 * This service handles gas sponsorship for users with no ETH balance.
 * It uses a funded sponsor wallet to execute transactions on behalf of users.
 */
class GasSponsorshipService {
  private sponsorWallet: ethers.Wallet | null = null;
  private provider: ethers.JsonRpcProvider | null = null;
  private readonly rpcUrl: string;

  constructor(rpcUrl: string = 'https://garfield-testnet.zircuit.com') {
    this.rpcUrl = rpcUrl;
  }

  /**
   * Initialize the sponsorship service with a funded sponsor wallet
   */
  async initialize(sponsorPrivateKey: string): Promise<void> {
    try {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      this.sponsorWallet = new ethers.Wallet(sponsorPrivateKey, this.provider);
      
      // Verify sponsor has funds
      const balance = await this.provider.getBalance(this.sponsorWallet.address);
      console.log('💰 Sponsor wallet balance:', ethers.formatEther(balance), 'ETH');
      
      if (balance === 0n) {
        throw new Error('Sponsor wallet has no ETH balance');
      }
      
      console.log('✅ Gas sponsorship service initialized with sponsor:', this.sponsorWallet.address);
    } catch (error) {
      console.error('❌ Failed to initialize gas sponsorship service:', error);
      throw error;
    }
  }

  /**
   * Check if the service is ready to sponsor transactions
   */
  isReady(): boolean {
    return this.sponsorWallet !== null && this.provider !== null;
  }

  /**
   * Get the sponsor wallet address
   */
  getSponsorAddress(): string | null {
    return this.sponsorWallet?.address || null;
  }

  /**
   * Execute a sponsored transaction
   * The sponsor wallet pays for gas, but the transaction is executed as intended
   */
  async executeSponsoredTransaction(
    contractAddress: string,
    contractABI: ethers.InterfaceAbi,
    functionName: string,
    args: unknown[],
    userAddress: string
  ): Promise<SponsorshipResult> {
    if (!this.isReady()) {
      throw new Error('Gas sponsorship service not initialized');
    }

    try {
      console.log('🔄 Executing sponsored transaction...');
      console.log('Contract:', contractAddress);
      console.log('Function:', functionName);
      console.log('Args:', args);
      console.log('User:', userAddress);
      console.log('Sponsor:', this.sponsorWallet!.address);

      // Create contract instance with sponsor wallet
      const contract = new ethers.Contract(contractAddress, contractABI, this.sponsorWallet!);

      // Estimate gas first
      const gasEstimate = await contract[functionName].estimateGas(...args);
      console.log('⛽ Estimated gas:', gasEstimate.toString());

      // Get current gas price
      const gasPrice = await this.provider!.getFeeData();
      const gasCost = gasEstimate * (gasPrice.gasPrice || 0n);
      console.log('💰 Estimated gas cost:', ethers.formatEther(gasCost), 'ETH');

      // Execute the transaction with sponsor wallet
      const tx = await contract[functionName](...args, {
        gasLimit: gasEstimate + 10000n, // Add buffer
      });

      console.log('📝 Sponsored transaction submitted:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Sponsored transaction confirmed:', receipt.hash);

      const actualGasCost = receipt.gasUsed * (receipt.gasPrice || 0n);

      return {
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        gasCost: ethers.formatEther(actualGasCost),
        sponsored: true,
      };
    } catch (error) {
      console.error('❌ Sponsored transaction failed:', error);
      throw new Error(`Sponsored transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check sponsor wallet balance
   */
  async getSponsorBalance(): Promise<string> {
    if (!this.isReady()) {
      throw new Error('Gas sponsorship service not initialized');
    }

    const balance = await this.provider!.getBalance(this.sponsorWallet!.address);
    return ethers.formatEther(balance);
  }

  /**
   * Estimate the cost of a transaction
   */
  async estimateTransactionCost(
    contractAddress: string,
    contractABI: ethers.InterfaceAbi,
    functionName: string,
    args: unknown[]
  ): Promise<{
    gasEstimate: string;
    gasCostEth: string;
    canSponsor: boolean;
  }> {
    if (!this.isReady()) {
      throw new Error('Gas sponsorship service not initialized');
    }

    try {
      const contract = new ethers.Contract(contractAddress, contractABI, this.sponsorWallet!);
      const gasEstimate = await contract[functionName].estimateGas(...args);
      
      const gasPrice = await this.provider!.getFeeData();
      const gasCost = gasEstimate * (gasPrice.gasPrice || 0n);
      
      const sponsorBalance = await this.provider!.getBalance(this.sponsorWallet!.address);
      const canSponsor = sponsorBalance >= gasCost;

      return {
        gasEstimate: gasEstimate.toString(),
        gasCostEth: ethers.formatEther(gasCost),
        canSponsor,
      };
    } catch (error) {
      console.error('Failed to estimate transaction cost:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const gasSponsorshipService = new GasSponsorshipService();

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as typeof window & {
    gasSponsorshipService: typeof gasSponsorshipService;
  }).gasSponsorshipService = gasSponsorshipService;
}
