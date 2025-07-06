import { usePrivy, useWallets } from '@privy-io/react-auth';

export interface WalletDebugInfo {
  privyReady: boolean;
  authenticated: boolean;
  userWalletAddress?: string;
  availableWallets: Array<{
    address: string;
    walletClientType: string;
    chainId?: string;
  }>;
  embeddedWallet?: {
    address: string;
    walletClientType: string;
    chainId?: string;
  };
  networkInfo?: {
    currentChainId?: string;
    expectedChainId: string;
    rpcUrl: string;
  };
}

export const useWalletDebug = (): WalletDebugInfo => {
  const { user, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();

  const userWalletAddress = user?.wallet?.address;
  
  const embeddedWallet = wallets.find(wallet => 
    wallet.walletClientType === 'privy' && 
    wallet.address.toLowerCase() === userWalletAddress?.toLowerCase()
  );

  return {
    privyReady: ready,
    authenticated,
    userWalletAddress,
    availableWallets: wallets.map(wallet => ({
      address: wallet.address,
      walletClientType: wallet.walletClientType,
    })),
    embeddedWallet: embeddedWallet ? {
      address: embeddedWallet.address,
      walletClientType: embeddedWallet.walletClientType,
    } : undefined,
    networkInfo: {
      expectedChainId: '0xbf02', // 48898 in hex
      rpcUrl: 'https://garfield-testnet.zircuit.com',
    },
  };
};

export const logWalletDebugInfo = (debugInfo: WalletDebugInfo): void => {
  console.group('🔍 Wallet Debug Information');
  console.log('Privy Ready:', debugInfo.privyReady);
  console.log('Authenticated:', debugInfo.authenticated);
  console.log('User Wallet Address:', debugInfo.userWalletAddress);
  console.log('Available Wallets:', debugInfo.availableWallets);
  console.log('Embedded Wallet:', debugInfo.embeddedWallet);
  console.log('Network Info:', debugInfo.networkInfo);
  console.groupEnd();
};

export const validateWalletSetup = (debugInfo: WalletDebugInfo): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  if (!debugInfo.privyReady) {
    issues.push('Privy is not ready');
  }

  if (!debugInfo.authenticated) {
    issues.push('User is not authenticated');
  }

  if (!debugInfo.userWalletAddress) {
    issues.push('No user wallet address available');
  }

  if (debugInfo.availableWallets.length === 0) {
    issues.push('No wallets available');
  }

  if (!debugInfo.embeddedWallet) {
    issues.push('No embedded wallet found');
  }

  if (debugInfo.userWalletAddress && debugInfo.embeddedWallet) {
    if (debugInfo.userWalletAddress.toLowerCase() !== debugInfo.embeddedWallet.address.toLowerCase()) {
      issues.push('User wallet address does not match embedded wallet address');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as typeof window & {
    walletDebug: {
      useWalletDebug: typeof useWalletDebug;
      logWalletDebugInfo: typeof logWalletDebugInfo;
      validateWalletSetup: typeof validateWalletSetup;
    };
  }).walletDebug = {
    useWalletDebug,
    logWalletDebugInfo,
    validateWalletSetup,
  };
}
