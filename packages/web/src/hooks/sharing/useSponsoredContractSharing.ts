import { useState, useCallback, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { gasSponsorshipService } from '../../lib/gasSponsorship/sponsorshipService';

// Contract ABI for sharing functions
const SHARING_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "uint8", "name": "shareType", "type": "uint8" }
    ],
    "name": "shareData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyShares",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint8", "name": "shareType", "type": "uint8" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct CycleDataStorage.SharedDataPackage[]",
        "name": "shares",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSharedWithMe",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint8", "name": "shareType", "type": "uint8" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct CycleDataStorage.SharedDataPackage[]",
        "name": "shares",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getShareCount",
    "outputs": [
      { "internalType": "uint256", "name": "count", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getReceivedShareCount",
    "outputs": [
      { "internalType": "uint256", "name": "count", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface ContractShare {
  ipfsHash: string;
  recipient: string;
  shareType: number;
  timestamp: number;
}

export interface SponsorshipInfo {
  isEnabled: boolean;
  sponsorAddress: string | null;
  sponsorBalance: string | null;
  lastGasCost: string | null;
}

export interface UseSponsoredContractSharing {
  shareDataOnChain: (
    recipientAddress: string,
    ipfsHash: string,
    shareType: 'partner' | 'family' | 'doctor'
  ) => Promise<string>; // Returns transaction hash
  getMyShares: () => Promise<ContractShare[]>;
  getSharedWithMe: () => Promise<ContractShare[]>;
  getShareCount: (userAddress?: string) => Promise<number>;
  getReceivedShareCount: (userAddress?: string) => Promise<number>;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  sponsorshipInfo: SponsorshipInfo;
  initializeSponsorship: () => Promise<void>;
}

export const useSponsoredContractSharing = (): UseSponsoredContractSharing => {
  const { user, authenticated, ready } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sponsorshipInfo, setSponsorshipInfo] = useState<SponsorshipInfo>({
    isEnabled: false,
    sponsorAddress: null,
    sponsorBalance: null,
    lastGasCost: null,
  });

  // Contract address from environment
  const CONTRACT_ADDRESS = import.meta.env.VITE_CYCLE_DATA_STORAGE_CONTRACT_ADDRESS;
  const SPONSOR_PRIVATE_KEY = import.meta.env.VITE_SPONSOR_PRIVATE_KEY;

  // Initialize gas sponsorship service
  const initializeSponsorship = useCallback(async (): Promise<void> => {
    if (!SPONSOR_PRIVATE_KEY) {
      console.warn('⚠️ No sponsor private key configured');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Initializing gas sponsorship service...');
      
      await gasSponsorshipService.initialize(SPONSOR_PRIVATE_KEY);
      
      const sponsorAddress = gasSponsorshipService.getSponsorAddress();
      const sponsorBalance = await gasSponsorshipService.getSponsorBalance();
      
      setSponsorshipInfo({
        isEnabled: true,
        sponsorAddress,
        sponsorBalance,
        lastGasCost: null,
      });
      
      console.log('✅ Gas sponsorship initialized successfully');
      console.log('💰 Sponsor:', sponsorAddress);
      console.log('💰 Balance:', sponsorBalance, 'ETH');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize gas sponsorship';
      console.error('❌ Gas sponsorship initialization failed:', errorMessage);
      setError(errorMessage);
      
      setSponsorshipInfo({
        isEnabled: false,
        sponsorAddress: null,
        sponsorBalance: null,
        lastGasCost: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [SPONSOR_PRIVATE_KEY]);

  // Auto-initialize when component mounts
  useEffect(() => {
    if (ready && SPONSOR_PRIVATE_KEY && !sponsorshipInfo.isEnabled) {
      initializeSponsorship();
    }
  }, [ready, SPONSOR_PRIVATE_KEY, sponsorshipInfo.isEnabled, initializeSponsorship]);

  const shareDataOnChain = useCallback(async (
    recipientAddress: string,
    ipfsHash: string,
    shareType: 'partner' | 'family' | 'doctor'
  ): Promise<string> => {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured');
    }

    if (!authenticated || !user?.wallet?.address) {
      throw new Error('User must be authenticated');
    }

    if (!sponsorshipInfo.isEnabled) {
      throw new Error('Gas sponsorship not available. Please initialize sponsorship first.');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Executing sponsored shareData transaction...');
      console.log('User:', user.wallet.address);
      console.log('Recipient:', recipientAddress);
      console.log('IPFS Hash:', ipfsHash);
      console.log('Share Type:', shareType);

      // Convert share type to number
      const shareTypeNumber = shareType === 'partner' ? 0 : shareType === 'family' ? 1 : 2;

      // Execute sponsored transaction
      const result = await gasSponsorshipService.executeSponsoredTransaction(
        CONTRACT_ADDRESS,
        SHARING_ABI,
        'shareData',
        [recipientAddress, ipfsHash, shareTypeNumber],
        user.wallet.address
      );

      console.log('✅ Sponsored transaction completed:', result.transactionHash);
      console.log('⛽ Gas used:', result.gasUsed);
      console.log('💰 Gas cost:', result.gasCost, 'ETH');

      // Update sponsorship info with latest gas cost
      setSponsorshipInfo(prev => ({
        ...prev,
        lastGasCost: result.gasCost,
      }));

      // Update sponsor balance
      try {
        const newBalance = await gasSponsorshipService.getSponsorBalance();
        setSponsorshipInfo(prev => ({
          ...prev,
          sponsorBalance: newBalance,
        }));
      } catch (balanceError) {
        console.warn('Could not update sponsor balance:', balanceError);
      }

      return result.transactionHash;
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Failed to share data on chain';
      
      // Enhanced error handling
      if (errorMessage.includes('insufficient funds')) {
        errorMessage = `Gas sponsor has insufficient funds. Sponsor balance: ${sponsorshipInfo.sponsorBalance} ETH. Please fund the sponsor wallet.`;
      } else if (errorMessage.includes('Gas sponsorship service not initialized')) {
        errorMessage = 'Gas sponsorship not ready. Please wait for initialization to complete.';
      }
      
      console.error('❌ Sponsored share transaction failed:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [CONTRACT_ADDRESS, authenticated, user?.wallet?.address, sponsorshipInfo]);

  // Read-only functions (no gas sponsorship needed)
  const getMyShares = useCallback(async (): Promise<ContractShare[]> => {
    // Implementation would use a read-only provider
    // For now, return empty array as this is a read operation
    console.log('📖 getMyShares - read operation (no gas needed)');
    return [];
  }, []);

  const getSharedWithMe = useCallback(async (): Promise<ContractShare[]> => {
    // Implementation would use a read-only provider
    console.log('📖 getSharedWithMe - read operation (no gas needed)');
    return [];
  }, []);

  const getShareCount = useCallback(async (_userAddress?: string): Promise<number> => {
    // Implementation would use a read-only provider
    console.log('📖 getShareCount - read operation (no gas needed)');
    return 0;
  }, []);

  const getReceivedShareCount = useCallback(async (_userAddress?: string): Promise<number> => {
    // Implementation would use a read-only provider
    console.log('📖 getReceivedShareCount - read operation (no gas needed)');
    return 0;
  }, []);

  const isReady = ready && !!CONTRACT_ADDRESS && sponsorshipInfo.isEnabled;

  return {
    shareDataOnChain,
    getMyShares,
    getSharedWithMe,
    getShareCount,
    getReceivedShareCount,
    isLoading,
    error,
    isReady,
    sponsorshipInfo,
    initializeSponsorship,
  };
};
