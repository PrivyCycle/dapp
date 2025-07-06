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

/**
 * Encryption service that leverages Privy's session management
 */
class PrivyEncryptionService {
  /**
   * Derive encryption key from user ID and salt using deterministic approach
   */
  private async deriveKeyFromUserId(userId: string, salt: Uint8Array): Promise<CryptoKey> {
    // Create a deterministic seed from user ID
    const userSeed = new TextEncoder().encode(`PrivyCycle-${userId}-${ENCRYPTION_VERSION}`);
    
    // Import the seed as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      userSeed,
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
   * Encrypt data using AES-GCM with user-derived key
   */
  async encrypt(data: string, userId: string): Promise<EncryptedData> {
    try {
      // Generate a random salt for this encryption
      const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
      
      // Get encryption key
      const key = await this.deriveKeyFromUserId(userId, salt);
      
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
   * Decrypt data using AES-GCM with user-derived key
   */
  async decrypt(encryptedData: EncryptedData, userId: string): Promise<string> {
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
      const key = await this.deriveKeyFromUserId(userId, salt);
      
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
      
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  /**
   * Encrypt data for a specific recipient using their public key
   */
  async encryptForRecipient(data: string, recipientPublicKey: string): Promise<EncryptedData> {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
      
      // Derive key from recipient's public key
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(recipientPublicKey),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

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
      
      return {
        version: ENCRYPTION_VERSION,
        salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
        iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
        data: Array.from(encryptedData).map(b => b.toString(16).padStart(2, '0')).join(''),
        tag: Array.from(tag).map(b => b.toString(16).padStart(2, '0')).join('')
      };
    } catch (error) {
      console.error('❌ Encryption for recipient failed:', error);
      throw new Error(`Encryption for recipient failed: ${error}`);
    }
  }

  /**
   * Decrypt data that was encrypted for the current user using their public key
   */
  async decryptFromRecipient(encryptedData: EncryptedData, userPublicKey: string): Promise<string> {
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
      
      // Derive key from user's public key (same as encryption)
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(userPublicKey),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

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
      
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('❌ Decryption from recipient failed:', error);
      throw new Error(`Decryption from recipient failed: ${error}`);
    }
  }

  /**
   * Clear any cached encryption keys or data
   */
  clearCache(): void {
    // Since this service doesn't maintain any cache currently,
    // this is a no-op but provides the interface for future caching
    console.log('Encryption cache cleared');
  }
}

// Hook to use Privy encryption service
export const usePrivyEncryption = () => {
  const { user, ready, authenticated } = usePrivy();

  const encryptionService = new PrivyEncryptionService();

  const encrypt = async (data: string): Promise<EncryptedData> => {
    if (!ready) {
      throw new Error('Privy is not ready yet. Please wait for initialization to complete.');
    }
    
    if (!authenticated) {
      throw new Error('User must be authenticated to encrypt data.');
    }
    
    if (!user?.id) {
      throw new Error('User ID not available. Please ensure you are properly authenticated.');
    }
    
    return encryptionService.encrypt(data, user.id);
  };

  const decrypt = async (encryptedData: EncryptedData): Promise<string> => {
    if (!ready) {
      throw new Error('Privy is not ready yet. Please wait for initialization to complete.');
    }
    
    if (!authenticated) {
      throw new Error('User must be authenticated to decrypt data.');
    }
    
    if (!user?.id) {
      throw new Error('User ID not available. Please ensure you are properly authenticated.');
    }
    
    return encryptionService.decrypt(encryptedData, user.id);
  };

  return {
    encrypt,
    decrypt,
    encryptForRecipient: encryptionService.encryptForRecipient.bind(encryptionService),
    decryptFromRecipient: encryptionService.decryptFromRecipient.bind(encryptionService),
    isReady: ready && authenticated && !!user?.id
  };
};

// Export the service class for direct use if needed
export { PrivyEncryptionService };
