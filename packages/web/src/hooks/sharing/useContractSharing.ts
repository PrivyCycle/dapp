import { useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';

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
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "sharer", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "indexed": false, "internalType": "uint8", "name": "shareType", "type": "uint8" }
    ],
    "name": "DataShared",
    "type": "event"
  }
];

export interface ContractShare {
  ipfsHash: string;
  recipient: string;
  shareType: number;
  timestamp: number;
}

export interface UseContractSharing {
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
  isReady: boolean; // Whether the system is ready for operations
  canPerformTransactions: boolean; // Whether user can perform write operations
}

export const useContractSharing = (): UseContractSharing => {
  const { user, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract address - this should come from environment variables
  const CONTRACT_ADDRESS = import.meta.env.VITE_CYCLE_DATA_STORAGE_CONTRACT_ADDRESS;

  // Helper function to validate initialization state
  const validateInitialization = useCallback((needsSigner = false): void => {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured. Please check your environment variables.');
    }

    if (!ready) {
      throw new Error('Privy is not ready yet. Please wait for initialization to complete.');
    }

    if (needsSigner && !authenticated) {
      throw new Error('User must be authenticated to perform write operations. Please log in first.');
    }

    if (needsSigner && !user?.wallet?.address) {
      throw new Error('User wallet not available. Please ensure you have a connected wallet.');
    }

    if (needsSigner && wallets.length === 0) {
      throw new Error('No wallets available. Please ensure your embedded wallet is created.');
    }
  }, [CONTRACT_ADDRESS, ready, authenticated, user?.wallet?.address, wallets.length]);

  const getContract = useCallback(async (needsSigner = false) => {
    // Validate initialization state first
    validateInitialization(needsSigner);

    // For read operations, we can use a public provider
    if (!needsSigner) {
      const provider = new ethers.JsonRpcProvider(
        import.meta.env.VITE_RPC_URL || 'https://garfield-testnet.zircuit.com'
      );
      return new ethers.Contract(CONTRACT_ADDRESS!, SHARING_ABI, provider);
    }

    // For write operations, we need the user's wallet
    const userAddress = user?.wallet?.address;
    if (!userAddress) {
      throw new Error('User wallet address not available');
    }

    console.log('🔍 Wallet Debug Info:');
    console.log('User Address:', userAddress);
    console.log('Available Wallets:', wallets.map(w => ({
      address: w.address,
      type: w.walletClientType,
      connected: w.connectorType
    })));

    // First, try to find the embedded wallet that matches the user's address
    let targetWallet = wallets.find(wallet => 
      wallet.walletClientType === 'privy' && 
      wallet.address.toLowerCase() === userAddress.toLowerCase()
    );

    // If no embedded wallet found, try any wallet with matching address
    if (!targetWallet) {
      targetWallet = wallets.find(wallet => 
        wallet.address.toLowerCase() === userAddress.toLowerCase()
      );
    }

    // If still no wallet found, use the first embedded wallet available
    if (!targetWallet) {
      targetWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
      
      if (targetWallet) {
        console.warn(`⚠️ Using first available embedded wallet: ${targetWallet.address} instead of user address: ${userAddress}`);
      }
    }

    if (!targetWallet) {
      throw new Error(`No suitable wallet found. User address: ${userAddress}, Available wallets: ${wallets.map(w => `${w.address} (${w.walletClientType})`).join(', ')}`);
    }

    console.log('✅ Selected wallet:', {
      address: targetWallet.address,
      type: targetWallet.walletClientType,
      matchesUser: targetWallet.address.toLowerCase() === userAddress.toLowerCase()
    });

    try {
      // Get the wallet's provider - this will handle automatic signing
      const provider = await targetWallet.getEthereumProvider();
      if (!provider) {
        throw new Error('Failed to get wallet provider from wallet');
      }

      // Ensure we're on the correct network
      try {
        const chainId = await provider.request({ method: 'eth_chainId' });
        const expectedChainId = '0xbf02'; // 48898 in hex (Zircuit testnet)
        
        if (chainId !== expectedChainId) {
          console.log(`Switching to Zircuit testnet (current: ${chainId}, expected: ${expectedChainId})`);
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: expectedChainId }],
            });
          } catch (switchError: unknown) {
            // If the chain hasn't been added to the wallet, add it
            if ((switchError as { code?: number })?.code === 4902) {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: expectedChainId,
                  chainName: 'Zircuit Testnet',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://garfield-testnet.zircuit.com'],
                  blockExplorerUrls: ['https://explorer.testnet.zircuit.com'],
                }],
              });
            } else {
              throw switchError;
            }
          }
        }
      } catch (networkError) {
        console.warn('Network setup warning:', networkError);
        // Continue anyway, the provider might handle this automatically
      }

      // Ensure the wallet is properly connected by requesting accounts
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        console.log('Connected accounts:', accounts);
        
        // Verify we have at least one account
        if (accounts.length === 0) {
          throw new Error('No accounts available from wallet');
        }

        // Log the account being used
        console.log('Using account:', accounts[0]);
        console.log('Target wallet address:', targetWallet.address);
        
        // Verify the account matches the target wallet address
        if (accounts[0].toLowerCase() !== targetWallet.address.toLowerCase()) {
          console.warn(`Account mismatch: wallet reports ${accounts[0]} but target wallet is ${targetWallet.address}`);
        }
      } catch (accountsError) {
        console.error('Failed to request accounts:', accountsError);
        throw new Error(`Failed to connect wallet accounts: ${accountsError}`);
      }

      // Create ethers provider from Privy's provider
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      
      // Get the actual signer address
      const signerAddress = await signer.getAddress();
      console.log('✅ Contract setup successful with signer:', signerAddress);
      
      // Check balance to help debug funding issues
      try {
        const balance = await ethersProvider.getBalance(signerAddress);
        console.log('💰 Signer balance:', ethers.formatEther(balance), 'ETH');
        
        if (balance === 0n) {
          console.warn('⚠️ Signer has no ETH balance! This will cause transaction failures.');
        }
      } catch (balanceError) {
        console.warn('Could not check balance:', balanceError);
      }
      
      return new ethers.Contract(CONTRACT_ADDRESS!, SHARING_ABI, signer);
    } catch (err) {
      console.error('Error setting up contract with signer:', err);
      throw new Error(`Failed to setup contract with signer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [validateInitialization, user?.wallet?.address, wallets, CONTRACT_ADDRESS]);

  const shareDataOnChain = useCallback(async (
    recipientAddress: string,
    ipfsHash: string,
    shareType: 'partner' | 'family' | 'doctor'
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContract(true);
      
      // Get the signer to check balance before attempting transaction
      const signer = contract.runner;
      if (signer && 'getAddress' in signer && 'provider' in signer) {
        const signerAddress = await (signer as ethers.Signer).getAddress();
        const provider = (signer as ethers.Signer).provider;
        
        if (provider) {
          try {
            const balance = await provider.getBalance(signerAddress);
            console.log('💰 Pre-transaction balance check:', ethers.formatEther(balance), 'ETH');
            
            if (balance === 0n) {
              const fundingMessage = `
❌ Insufficient funds: Your wallet (${signerAddress}) has no ETH balance.

🚰 To fund your wallet:
1. Go to the Zircuit testnet faucet: https://faucet.zircuit.com/
2. Enter your wallet address: ${signerAddress}
3. Request testnet ETH
4. Wait for the transaction to confirm
5. Try your transaction again

Note: You may need to connect your wallet to the faucet website first.
              `.trim();
              
              console.error(fundingMessage);
              throw new Error(`Insufficient funds. Your wallet has no ETH balance. Please visit https://faucet.zircuit.com/ to get testnet ETH for address: ${signerAddress}`);
            }
          } catch (balanceError) {
            console.warn('Could not check balance before transaction:', balanceError);
          }
        }
      }
      
      // Convert share type to number
      const shareTypeNumber = shareType === 'partner' ? 0 : shareType === 'family' ? 1 : 2;
      
      // Call the contract function
      const tx = await contract.shareData(recipientAddress, ipfsHash, shareTypeNumber);
      
      console.log('📝 Share transaction submitted:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log('✅ Share transaction confirmed:', receipt.hash);
      
      return receipt.hash;
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Failed to share data on chain';
      
      // Enhanced error handling for common issues
      if (errorMessage.includes('insufficient funds') || errorMessage.includes('INSUFFICIENT_FUNDS')) {
        const signerAddress = user?.wallet?.address || 'your wallet';
        errorMessage = `Insufficient funds: Your wallet (${signerAddress}) needs ETH to pay for gas fees. Please visit https://faucet.zircuit.com/ to get testnet ETH.`;
      } else if (errorMessage.includes('invalid sender')) {
        errorMessage = 'Wallet connection issue: The transaction sender does not match your connected wallet. Please try refreshing the page and reconnecting your wallet.';
      } else if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction cancelled: You rejected the transaction in your wallet.';
      }
      
      console.error('❌ Share transaction failed:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getContract, user?.wallet?.address]);

  const getMyShares = useCallback(async (): Promise<ContractShare[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContract(false);
      const shares = await contract.getMyShares();
      
      return shares.map((share: {
        ipfsHash: string;
        recipient: string;
        shareType: bigint;
        timestamp: bigint;
      }) => ({
        ipfsHash: share.ipfsHash,
        recipient: share.recipient,
        shareType: Number(share.shareType),
        timestamp: Number(share.timestamp)
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get shares';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getContract]);

  const getSharedWithMe = useCallback(async (): Promise<ContractShare[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContract(false);
      const shares = await contract.getSharedWithMe();
      
      return shares.map((share: {
        ipfsHash: string;
        recipient: string;
        shareType: bigint;
        timestamp: bigint;
      }) => ({
        ipfsHash: share.ipfsHash,
        recipient: share.recipient,
        shareType: Number(share.shareType),
        timestamp: Number(share.timestamp)
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get received shares';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getContract]);

  const getShareCount = useCallback(async (userAddress?: string): Promise<number> => {
    try {
      const contract = await getContract(false);
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
  }, [getContract, user?.wallet?.address]);

  const getReceivedShareCount = useCallback(async (userAddress?: string): Promise<number> => {
    try {
      const contract = await getContract(false);
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
  }, [getContract, user?.wallet?.address]);

  // Computed properties for readiness checks
  const isReady = ready && !!CONTRACT_ADDRESS;
  const canPerformTransactions = isReady && authenticated && !!user?.wallet?.address;

  return {
    shareDataOnChain,
    getMyShares,
    getSharedWithMe,
    getShareCount,
    getReceivedShareCount,
    isLoading,
    error,
    isReady,
    canPerformTransactions
  };
};
