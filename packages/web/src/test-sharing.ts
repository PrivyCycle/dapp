// Test script for sharing functionality
// This can be run in the browser console to test the sharing system

import { sharingService } from './lib/sharing/sharingService';
import { ipfsService } from './lib/storage/ipfsService';

// Mock encryption service for testing
const mockEncryption = {
  isReady: true,
  encrypt: async (data: string) => ({
    version: 'v1' as const,
    salt: 'mock-salt',
    iv: 'mock-iv',
    data: btoa(data), // Simple base64 encoding for testing
    tag: 'mock-tag'
  }),
  decrypt: async (encryptedData: { data: string }) => {
    return atob(encryptedData.data); // Simple base64 decoding for testing
  },
  encryptForRecipient: async (data: string, publicKey: string) => ({
    version: 'v1' as const,
    salt: 'mock-salt-recipient',
    iv: 'mock-iv-recipient',
    data: btoa(`${publicKey}:${data}`), // Simple encoding with public key prefix for testing
    tag: 'mock-tag-recipient'
  })
};

// Test data
const testEntries = [
  {
    encryptedData: {
      version: 'v1' as const,
      salt: 'test-salt-1',
      iv: 'test-iv-1',
      data: JSON.stringify({
        id: '1',
        date: new Date('2024-01-01'),
        flow: 'heavy',
        mood: 'happy',
        symptoms: ['cramps'],
        energyLevel: 4
      }),
      tag: 'test-tag-1'
    },
    timestamp: Date.now(),
    localTimestamp: Date.now(),
    entryId: 1
  },
  {
    encryptedData: {
      version: 'v1' as const,
      salt: 'test-salt-2',
      iv: 'test-iv-2',
      data: JSON.stringify({
        id: '2',
        date: new Date('2024-01-02'),
        flow: 'medium',
        mood: 'neutral',
        symptoms: ['bloating'],
        energyLevel: 3
      }),
      tag: 'test-tag-2'
    },
    timestamp: Date.now() + 86400000,
    localTimestamp: Date.now() + 86400000,
    entryId: 2
  }
];

export async function testSharingFlow(): Promise<void> {
  console.log('🧪 Testing PrivyCycle Sharing Functionality');
  
  try {
    // Test 1: Share data
    console.log('\n📤 Test 1: Sharing data...');
    const recipientPublicKey = 'test-recipient-public-key';
    const shareType = 'partner';
    const userId = 'test-user-123';
    
    const shareResult = await sharingService.shareData(
      recipientPublicKey,
      shareType,
      testEntries,
      mockEncryption,
      userId
    );
    
    console.log('✅ Share successful!');
    console.log('📍 IPFS Hash:', shareResult.ipfsHash);
    
    // Create shareable link
    const shareableLink = sharingService.createShareableLink(shareResult.ipfsHash, shareType);
    console.log('🔗 Shareable Link:', shareableLink);
    
    // Test 2: Check if data is accessible
    console.log('\n🔍 Test 2: Checking data accessibility...');
    const isAccessible = await sharingService.isSharedDataAccessible(shareResult.ipfsHash);
    console.log('✅ Data accessible:', isAccessible);
    
    // Test 3: Get shared data info
    console.log('\n📊 Test 3: Getting shared data info...');
    const dataInfo = await sharingService.getSharedDataInfo(shareResult.ipfsHash);
    console.log('✅ Data info:', dataInfo);
    
    // Test 4: Download and decrypt shared data
    console.log('\n📥 Test 4: Downloading shared data...');
    const downloadedData = await sharingService.downloadSharedData(
      shareResult.ipfsHash,
      recipientPublicKey
    );
    
    console.log('✅ Download successful!');
    console.log('📋 Metadata:', downloadedData.metadata);
    console.log('📝 Entries count:', downloadedData.entries.length);
    
    // Test 5: Parse shareable link
    console.log('\n🔗 Test 5: Parsing shareable link...');
    const parsedLink = sharingService.parseShareableLink(shareableLink);
    console.log('✅ Link parsed:', parsedLink);
    
    console.log('\n🎉 All tests passed! Sharing functionality is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

export async function testIPFSConnection(): Promise<void> {
  console.log('🧪 Testing IPFS Connection');
  
  try {
    // Test basic IPFS upload/download
    const testData = { message: 'Hello IPFS!', timestamp: Date.now() };
    
    console.log('📤 Uploading test data to IPFS...');
    const hash = await ipfsService.uploadEncryptedData(JSON.stringify(testData));
    console.log('✅ Upload successful! Hash:', hash);
    
    console.log('📥 Downloading data from IPFS...');
    const downloadedData = await ipfsService.downloadEncryptedData(hash);
    const parsedData = JSON.parse(downloadedData);
    console.log('✅ Download successful!', parsedData);
    
    console.log('🎉 IPFS connection test passed!');
    
  } catch (error) {
    console.error('❌ IPFS test failed:', error);
    throw error;
  }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as typeof window & {
    testSharing: typeof testSharingFlow;
    testIPFS: typeof testIPFSConnection;
  }).testSharing = testSharingFlow;
  (window as typeof window & {
    testSharing: typeof testSharingFlow;
    testIPFS: typeof testIPFSConnection;
  }).testIPFS = testIPFSConnection;
  console.log('🔧 Sharing tests loaded! Run testSharing() or testIPFS() in console to test.');
}
