import { usePrivy } from '@privy-io/react-auth';

// Constants for encryption
const ENCRYPTION_VERSION = 'v1';
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export interface EncryptedData {
  version: string;
  salt: string;
  iv: string;
  data: string;
  tag: string;
}

class PrivyEncryptionService {
  private cachedSignature: string | null = null;
  private cachedUserId: string | null = null;

  /**
   * Generate a deterministic signature using Privy wallet
   */
  private async generateWalletSignature(userId: string, signMessage: (message: { message: string }) => Promise<{ signature: string }>): Promise<string> {
    // Check if we have a cached signature for this user
    if (this.cachedSignature && this.cachedUserId === userId) {
      console.log('🔑 Using cached wallet signature for user:', userId);
      return this.cachedSignature;
    }

    // Create a deterministic message based on user ID and app context
    const message = `ConsentCycle-Encryption-Key-${userId}-${ENCRYPTION_VERSION}`;
    
    console.log('🔑 Generating wallet signature for user:', userId);
    
    // Retry logic for wallet signature generation
    const maxRetries = 3;
    let lastError: Error | unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔑 Signature attempt ${attempt}/${maxRetries}`);
        
        // Add a small delay between retries
        if (attempt > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        
        const result = await signMessage({ message });
        console.log('✅ Wallet signature generated');
        
        // Cache the signature for this session
        this.cachedSignature = result.signature;
        this.cachedUserId = userId;
        
        return result.signature;
      } catch (error) {
        lastError = error;
        console.warn(`❌ Signature attempt ${attempt} failed:`, error);
        
        // Check if this is a wallet connectivity issue
        if (error instanceof Error && 
            (error.message.includes('Unable to connect to wallet') || 
             error.message.includes('provider_error') ||
             error.message.includes('Wallet did not respond'))) {
          
          if (attempt < maxRetries) {
            console.log(`🔄 Retrying signature generation (${attempt + 1}/${maxRetries})...`);
            continue;
          }
        } else {
          // For other errors, don't retry
          break;
        }
      }
    }
    
    console.error('❌ Failed to generate wallet signature after all retries:', lastError);
    throw new Error(`Failed to generate wallet signature after ${maxRetries} attempts: ${lastError}`);
  }

  /**
   * Derive encryption key from wallet signature
   */
  private async deriveKeyFromSignature(signature: string, salt: Uint8Array): Promise<CryptoKey> {
    // Convert signature to bytes
    const signatureBytes = new TextEncoder().encode(signature);
    
    // Import the signature as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      signatureBytes,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive the actual encryption key using PBKDF2
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return key;
  }

  /**
   * Get encryption key for the current user with given salt
   */
  private async getEncryptionKey(userId: string, signMessage: (message: { message: string }) => Promise<{ signature: string }>, salt: Uint8Array): Promise<CryptoKey> {
    // Get the consistent signature for this user
    const signature = await this.generateWalletSignature(userId, signMessage);
    
    // Derive key using the signature and the provided salt
    const key = await this.deriveKeyFromSignature(signature, salt);
    
    return key;
  }

  /**
   * Encrypt data using AES-GCM
   */
  async encrypt(data: string, userId: string, signMessage: (message: { message: string }) => Promise<{ signature: string }>): Promise<EncryptedData> {
    console.log('🔐 Starting encryption for user:', userId);
    
    try {
      // Generate a random salt for this encryption
      const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
      
      // Get encryption key
      const key = await this.getEncryptionKey(userId, signMessage, salt);
      console.log('✅ Encryption key obtained');
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
      
      // Encrypt the data
      const encodedData = new TextEncoder().encode(data);
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );
      
      // Extract the encrypted data and tag
      const encryptedData = new Uint8Array(encryptedBuffer.slice(0, -TAG_LENGTH));
      const tag = new Uint8Array(encryptedBuffer.slice(-TAG_LENGTH));
      
      console.log('✅ Data encrypted successfully');
      
      return {
        version: ENCRYPTION_VERSION,
        salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
        iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
        data: Array.from(encryptedData).map(b => b.toString(16).padStart(2, '0')).join(''),
        tag: Array.from(tag).map(b => b.toString(16).padStart(2, '0')).join('')
      };
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt data using AES-GCM
   */
  async decrypt(encryptedData: EncryptedData, userId: string, signMessage: (message: { message: string }) => Promise<{ signature: string }>): Promise<string> {
    console.log('🔓 Starting decryption for user:', userId);
    
    try {
      // Validate version
      if (encryptedData.version !== ENCRYPTION_VERSION) {
        throw new Error(`Unsupported encryption version: ${encryptedData.version}`);
      }
      
      // Convert hex strings back to Uint8Arrays
      const salt = new Uint8Array(encryptedData.salt.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      const iv = new Uint8Array(encryptedData.iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      const data = new Uint8Array(encryptedData.data.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      const tag = new Uint8Array(encryptedData.tag.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      
      // Get decryption key using the salt from the encrypted data
      const key = await this.getEncryptionKey(userId, signMessage, salt);
      console.log('✅ Decryption key obtained');
      
      // Combine data and tag for decryption
      const combinedData = new Uint8Array(data.length + tag.length);
      combinedData.set(data);
      combinedData.set(tag, data.length);
      
      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        combinedData
      );
      
      const result = new TextDecoder().decode(decryptedBuffer);
      console.log('✅ Data decrypted successfully');
      
      return result;
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  /**
   * Clear cached signature (call on logout)
   */
  clearCache(): void {
    this.cachedSignature = null;
    this.cachedUserId = null;
  }
}

// Hook to use Privy encryption service
export const usePrivyEncryption = () => {
  const { signMessage, user } = usePrivy();

  const encryptionService = new PrivyEncryptionService();

  // Wrapper to adapt Privy's signMessage to our internal interface
  const adaptedSignMessage = async (message: { message: string }): Promise<{ signature: string }> => {
    return await signMessage(message);
  };

  const encrypt = async (data: string): Promise<EncryptedData> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    return encryptionService.encrypt(data, user.id, adaptedSignMessage);
  };

  const decrypt = async (encryptedData: EncryptedData): Promise<string> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    return encryptionService.decrypt(encryptedData, user.id, adaptedSignMessage);
  };

  const clearCache = () => {
    encryptionService.clearCache();
  };

  return {
    encrypt,
    decrypt,
    clearCache,
    isReady: !!user?.id
  };
};

// Export the service class for direct use if needed
export { PrivyEncryptionService }; 