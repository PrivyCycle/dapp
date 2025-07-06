import { ethers } from 'ethers';

// Contract ABI for reading functions
const SHARING_ABI = [
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

async function testContractReads(): Promise<void> {
  console.log('🔍 Testing contract read operations...');
  
  // Get environment variables
  const CONTRACT_ADDRESS = import.meta.env.VITE_CYCLE_DATA_STORAGE_CONTRACT_ADDRESS;
  const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://garfield-testnet.zircuit.com';
  
  // Test addresses from the transaction
  const SHARER_ADDRESS = '0x95622638d50D813FB7D425DDf17A54D5A5A353CA'; // Who shared the data
  const RECIPIENT_ADDRESS = '0xCb36bd09998c5687af9Bf3348B25245976Fd3e7F'; // Who received the data
  
  console.log('📋 Configuration:');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('RPC URL:', RPC_URL);
  console.log('Sharer:', SHARER_ADDRESS);
  console.log('Recipient:', RECIPIENT_ADDRESS);
  
  if (!CONTRACT_ADDRESS) {
    console.error('❌ Contract address not configured');
    return;
  }
  
  try {
    // Create provider and contract
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SHARING_ABI, provider);
    
    console.log('\n🔍 Testing share counts...');
    
    // Test share counts
    const sharerShareCount = await contract.getShareCount(SHARER_ADDRESS);
    const recipientReceivedCount = await contract.getReceivedShareCount(RECIPIENT_ADDRESS);
    
    console.log(`📊 Sharer (${SHARER_ADDRESS}) share count:`, Number(sharerShareCount));
    console.log(`📊 Recipient (${RECIPIENT_ADDRESS}) received count:`, Number(recipientReceivedCount));
    
    console.log('\n🔍 Testing getSharedByUser...');
    
    // Test getting shares by sharer
    const sharedBySharer = await contract.getSharedByUser(SHARER_ADDRESS);
    console.log(`📤 Shares created by sharer (${sharedBySharer.length} items):`);
    sharedBySharer.forEach((share: any, index: number) => {
      console.log(`  ${index + 1}. IPFS: ${share.ipfsHash}`);
      console.log(`     From: ${share.sharer}`);
      console.log(`     To: ${share.recipient}`);
      console.log(`     Type: ${share.shareType}`);
      console.log(`     Time: ${new Date(Number(share.timestamp) * 1000).toISOString()}`);
    });
    
    console.log('\n🔍 Testing getSharedWithUser...');
    
    // Test getting shares received by recipient
    const sharedWithRecipient = await contract.getSharedWithUser(RECIPIENT_ADDRESS);
    console.log(`📥 Shares received by recipient (${sharedWithRecipient.length} items):`);
    sharedWithRecipient.forEach((share: any, index: number) => {
      console.log(`  ${index + 1}. IPFS: ${share.ipfsHash}`);
      console.log(`     From: ${share.sharer}`);
      console.log(`     To: ${share.recipient}`);
      console.log(`     Type: ${share.shareType}`);
      console.log(`     Time: ${new Date(Number(share.timestamp) * 1000).toISOString()}`);
    });
    
    console.log('\n✅ Contract read test completed successfully!');
    
    if (sharedBySharer.length === 0 && sharedWithRecipient.length === 0) {
      console.log('\n⚠️  No shares found. This could mean:');
      console.log('   1. The transaction hasn\'t been indexed yet (wait a few minutes)');
      console.log('   2. The contract address is incorrect');
      console.log('   3. The transaction failed or was reverted');
      console.log('   4. The addresses don\'t match the actual transaction');
    }
    
  } catch (error) {
    console.error('❌ Contract read test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('could not detect network')) {
        console.log('💡 Network detection failed. Check RPC URL configuration.');
      } else if (error.message.includes('call revert exception')) {
        console.log('💡 Contract call reverted. Check contract address and ABI.');
      } else if (error.message.includes('network does not support ENS')) {
        console.log('💡 Network configuration issue. This is usually not critical.');
      }
    }
  }
}

// Export for use in browser console
(window as any).testContractReads = testContractReads;

// Auto-run if this script is imported
testContractReads().catch(console.error);
