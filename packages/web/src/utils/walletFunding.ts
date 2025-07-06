import { ethers } from 'ethers';

export interface WalletBalance {
  address: string;
  balance: string;
  balanceWei: bigint;
  needsFunding: boolean;
}

export const checkWalletBalances = async (
  addresses: string[],
  rpcUrl: string = 'https://garfield-testnet.zircuit.com'
): Promise<WalletBalance[]> => {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const results: WalletBalance[] = [];

  for (const address of addresses) {
    try {
      const balanceWei = await provider.getBalance(address);
      const balance = ethers.formatEther(balanceWei);
      
      results.push({
        address,
        balance,
        balanceWei,
        needsFunding: balanceWei === 0n
      });
    } catch (error) {
      console.error(`Failed to check balance for ${address}:`, error);
      results.push({
        address,
        balance: 'Error',
        balanceWei: 0n,
        needsFunding: true
      });
    }
  }

  return results;
};

export const logWalletBalances = async (addresses: string[]): Promise<void> => {
  console.group('💰 Wallet Balance Check');
  
  const balances = await checkWalletBalances(addresses);
  
  balances.forEach(wallet => {
    const status = wallet.needsFunding ? '❌ NEEDS FUNDING' : '✅ HAS BALANCE';
    console.log(`${wallet.address}: ${wallet.balance} ETH ${status}`);
  });
  
  const unfundedWallets = balances.filter(w => w.needsFunding);
  if (unfundedWallets.length > 0) {
    console.warn('⚠️ Wallets that need funding:');
    unfundedWallets.forEach(wallet => {
      console.warn(`  - ${wallet.address}`);
    });
    console.warn('💡 Get testnet ETH from: https://faucet.zircuit.com/');
  }
  
  console.groupEnd();
};

export const getFundingInstructions = (address: string): string => {
  return `
🚰 To fund your wallet:

1. Go to the Zircuit testnet faucet: https://faucet.zircuit.com/
2. Enter your wallet address: ${address}
3. Request testnet ETH
4. Wait for the transaction to confirm
5. Try your transaction again

Note: You may need to connect your wallet to the faucet website first.
  `.trim();
};

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as typeof window & {
    walletFunding: {
      checkWalletBalances: typeof checkWalletBalances;
      logWalletBalances: typeof logWalletBalances;
      getFundingInstructions: typeof getFundingInstructions;
    };
  }).walletFunding = {
    checkWalletBalances,
    logWalletBalances,
    getFundingInstructions,
  };
}
