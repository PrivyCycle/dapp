/**
 * Test script to verify the new sharing encryption works correctly
 */

import { sharingService } from './lib/sharing/sharingService';

async function testSharingEncryption(): Promise<void> {
  console.log('🧪 Testing sharing encryption...');
  
  const testData = JSON.stringify({
    date: new Date().toISOString(),
    symptoms: ['cramping', 'bloating'],
    flow: 'medium',
    mood: 'happy',
    energy: 4,
    notes: 'Test sharing data'
  });
  
  const recipientAddress = '0xCb36bd09998c5687af9Bf3348B25245976Fd3e7F';
  
  try {
    // Test encryption
    console.log('🔐 Encrypting data for recipient...');
    const encrypted = await sharingService.encryptForRecipient(testData, recipientAddress);
    console.log('✅ Encryption successful:', {
      version: encrypted.version,
      salt: encrypted.salt,
      ivLength: encrypted.iv.length,
      dataLength: encrypted.data.length,
      tagLength: encrypted.tag.length
    });
    
    // Test decryption
    console.log('🔓 Decrypting data...');
    const decrypted = await sharingService.decryptFromRecipient(encrypted, recipientAddress);
    console.log('✅ Decryption successful');
    
    // Verify data integrity
    const originalData = JSON.parse(testData);
    const decryptedData = JSON.parse(decrypted);
    
    const isMatch = JSON.stringify(originalData) === JSON.stringify(decryptedData);
    console.log('🔍 Data integrity check:', isMatch ? '✅ PASS' : '❌ FAIL');
    
    if (isMatch) {
      console.log('🎉 Sharing encryption test completed successfully!');
    } else {
      console.error('❌ Data mismatch:', { originalData, decryptedData });
    }
    
  } catch (error) {
    console.error('❌ Sharing encryption test failed:', error);
  }
}

// Run the test
testSharingEncryption().catch(console.error);
