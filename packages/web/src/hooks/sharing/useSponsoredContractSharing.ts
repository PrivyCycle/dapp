import { useState, useCallback, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
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
    "inputs": [
      { "internalType": "address", "name": "sharer", "type": "address" },
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "uint8", "name": "shareType", "type": "uint8" }
    ],
    "name": "shareDataSponsored",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getSharedByUser",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "address", "name": "sharer", "type": "address" },
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
    "name": "getSharedWithUser",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "address", "name": "sharer", "type": "address" },
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
  sharer: string;
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

  // Helper function to get read-only contract
  const getReadOnlyContract = useCallback(() => {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured');
    }

    const provider = new ethers.JsonRpcProvider(
      import.meta.env.VITE_RPC_URL || 'https://garfield-testnet.zircuit.com'
    );
    return new ethers.Contract(CONTRACT_ADDRESS, SHARING_ABI, provider);
  }, [CONTRACT_ADDRESS]);

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

      // Execute sponsored transaction using shareDataSponsored to preserve actual sharer identity
      const result = await gasSponsorshipService.executeSponsoredTransaction(
        CONTRACT_ADDRESS,
        SHARING_ABI,
        'shareDataSponsored',
        [user.wallet.address, recipientAddress, ipfsHash, shareTypeNumber],
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
    if (!authenticated || !user?.wallet?.address) {
      throw new Error('User must be authenticated');
    }

    try {
      console.log('📖 getMyShares - reading from blockchain...');
      console.log('User address:', user.wallet.address);
      
      const contract = getReadOnlyContract();
      
      // Use getSharedByUser to get shares created by this user
      const shares = await contract.getSharedByUser(user.wallet.address);
      console.log('Raw shares from contract:', shares);
      
      return shares.map((share: {
        ipfsHash: string;
        sharer: string;
        recipient: string;
        shareType: bigint;
        timestamp: bigint;
      }) => ({
        ipfsHash: share.ipfsHash,
        sharer: share.sharer,
        recipient: share.recipient,
        shareType: Number(share.shareType),
        timestamp: Number(share.timestamp)
      }));
    } catch (err) {
      console.error('Failed to get my shares:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to get shares');
    }
  }, [getReadOnlyContract, authenticated, user?.wallet?.address]);

  const getSharedWithMe = useCallback(async (): Promise<ContractShare[]> => {
    if (!authenticated || !user?.wallet?.address) {
      throw new Error('User must be authenticated');
    }

    try {
      console.log('📖 getSharedWithMe - reading from blockchain...');
      console.log('User address:', user.wallet.address);
      
      const contract = getReadOnlyContract();
      
      // Use getSharedWithUser to get shares received by this user
      const shares = await contract.getSharedWithUser(user.wallet.address);
      console.log('Raw shared with me from contract:', shares);
      
      return shares.map((share: {
        ipfsHash: string;
        sharer: string;
        recipient: string;
        shareType: bigint;
        timestamp: bigint;
      }) => ({
        ipfsHash: share.ipfsHash,
        sharer: share.sharer,
        recipient: share.recipient,
        shareType: Number(share.shareType),
        timestamp: Number(share.timestamp)
      }));
    } catch (err) {
      console.error('Failed to get shared with me:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to get received shares');
    }
  }, [getReadOnlyContract, authenticated, user?.wallet?.address]);

  const getShareCount = useCallback(async (userAddress?: string): Promise<number> => {
    try {
      const contract = getReadOnlyContract();
      const address = userAddress || user?.wallet?.address;
      
      if (!address) {
        throw new Error('No address provided');
      }
      
      const count = await contract.getShareCount(address);
      return Number(count);
    } catch (err) {
      console.error('Failed to get share count:', err);
      return 0;
    }
  }, [getReadOnlyContract, user?.wallet?.address]);

  const getReceivedShareCount = useCallback(async (userAddress?: string): Promise<number> => {
    try {
      const contract = getReadOnlyContract();
      const address = userAddress || user?.wallet?.address;
      
      if (!address) {
        throw new Error('No address provided');
      }
      
      const count = await contract.getReceivedShareCount(address);
      return Number(count);
    } catch (err) {
      console.error('Failed to get received share count:', err);
      return 0;
    }
  }, [getReadOnlyContract, user?.wallet?.address]);

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
