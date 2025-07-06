import { sharingService } from './lib/sharing/sharingService';
import { ipfsService } from './lib/storage/ipfsService';

async function testIPFSDecryption(): Promise<void> {
  console.log('🧪 Testing IPFS decryption...');
  
  const IPFS_HASH = 'bafkreicnnazaebrtgcpa2743ap4g7vlns7fwdw7bvjuyab6vfhetlm2g3m';
  const USER_ADDRESS = '0xCb36bd09998c5687af9Bf3348B25245976Fd3e7F';
  
  try {
    console.log('📥 Step 1: Testing IPFS download...');
    const rawData = await ipfsService.downloadEncryptedData(IPFS_HASH);
    console.log('✅ Raw IPFS data:', rawData);
    
    console.log('📦 Step 2: Parsing JSON...');
    const parsedData = JSON.parse(rawData);
    console.log('✅ Parsed data structure:', parsedData);
    
    console.log('🔓 Step 3: Testing sharingService decryption...');
    const decryptedData = await sharingService.downloadSharedData(IPFS_HASH, USER_ADDRESS);
    console.log('✅ Decrypted data:', decryptedData);
    
    console.log('📋 Step 4: Processing entries...');
    if (decryptedData.entries) {
      for (const entry of decryptedData.entries) {
        console.log(`Entry ${entry.entryId}:`, entry);
        
        // Check if it has decryptedData
        if ('decryptedData' in entry) {
          console.log(`  Decrypted content:`, entry.decryptedData);
        } else {
          console.log(`  Encrypted content:`, entry.encryptedData);
        }
      }
    }
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Try to get more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Try basic IPFS access
    try {
      console.log('🔍 Testing basic IPFS access...');
      const accessible = await ipfsService.isAccessible(IPFS_HASH);
      console.log('IPFS accessible:', accessible);
      
      const fileInfo = await ipfsService.getFileInfo(IPFS_HASH);
      console.log('File info:', fileInfo);
    } catch (ipfsError) {
      console.error('IPFS access error:', ipfsError);
    }
  }
}

// Export for browser console
(window as any).testIPFSDecryption = testIPFSDecryption;

// Auto-run
testIPFSDecryption().catch(console.error);
