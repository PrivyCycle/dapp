import { ipfsService } from '../storage/ipfsService';
import type { EncryptedData } from '../encryption/privyEncryption';

export interface ShareableData {
  entries: Array<{
    encryptedData: EncryptedData;
    timestamp: number;
    localTimestamp: number;
    entryId: number;
  }>;
  metadata: {
    sharedBy: string;
    sharedAt: number;
    shareType: 'partner' | 'family' | 'doctor';
    totalEntries: number;
  };
}

export interface ShareResult {
  ipfsHash: string;
  gatewayUrl: string;
  shareType: number; // 0=partner, 1=family, 2=doctor
}

export interface ReceivedShare {
  ipfsHash: string;
  sharer: string;
  shareType: number;
  timestamp: number;
  data?: ShareableData;
}

// This service will be used with the encryption hook
class SharingService {
  /**
   * Share encrypted data with another user
   * @param recipientPublicKey The recipient's public key for encryption
   * @param shareType The type of sharing relationship
   * @param entries The data entries to share
   * @param encryptionService The encryption service instance from the hook
   * @param currentUserId The current user's ID
   * @returns Share result with IPFS hash and metadata
   */
  async shareData(
    recipientPublicKey: string,
    shareType: 'partner' | 'family' | 'doctor',
    entries: Array<{
      encryptedData: EncryptedData;
      timestamp: number;
      localTimestamp: number;
      entryId: number;
    }>,
    encryptionService: {
      decrypt: (data: EncryptedData) => Promise<string>;
      encryptForRecipient: (data: string, publicKey: string) => Promise<EncryptedData>;
    },
    currentUserId: string
  ): Promise<ShareResult> {
    try {
      console.log('🔄 Starting data sharing process...');

      // First, decrypt all entries with current user's key
      const decryptedEntries = [];
      for (const entry of entries) {
        try {
          const decrypted = await encryptionService.decrypt(entry.encryptedData);
          decryptedEntries.push({
            ...entry,
            decryptedData: decrypted
          });
        } catch (error) {
          console.warn('Failed to decrypt entry:', entry.entryId, error);
          // Skip entries that can't be decrypted
          continue;
        }
      }

      if (decryptedEntries.length === 0) {
        throw new Error('No entries could be decrypted for sharing');
      }

      // Re-encrypt all entries with recipient's public key
      const reencryptedEntries = [];
      for (const entry of decryptedEntries) {
        try {
          // Use the encryption service's encryptForRecipient method
          const reencrypted = await encryptionService.encryptForRecipient(entry.decryptedData, recipientPublicKey);
          reencryptedEntries.push({
            encryptedData: reencrypted,
            timestamp: entry.timestamp,
            localTimestamp: entry.localTimestamp,
            entryId: entry.entryId
          });
        } catch (error) {
          console.error('Failed to re-encrypt entry:', entry.entryId, error);
          throw new Error(`Failed to re-encrypt data for recipient: ${error}`);
        }
      }

      // Create shareable data package
      const shareableData: ShareableData = {
        entries: reencryptedEntries,
        metadata: {
          sharedBy: currentUserId,
          sharedAt: Date.now(),
          shareType,
          totalEntries: reencryptedEntries.length
        }
      };

      // Upload to IPFS
      const ipfsHash = await ipfsService.uploadEncryptedData(
        JSON.stringify(shareableData),
        `cycle-share-${shareType}-${Date.now()}.json`
      );

      const gatewayUrl = ipfsService.getGatewayUrl(ipfsHash);

      console.log('✅ Data sharing completed successfully');
      
      return {
        ipfsHash,
        gatewayUrl,
        shareType: this.getShareTypeNumber(shareType)
      };
    } catch (error) {
      console.error('❌ Data sharing failed:', error);
      throw new Error(`Sharing failed: ${error}`);
    }
  }

  /**
   * Download and decrypt shared data
   * @param ipfsHash The IPFS hash of the shared data
   * @param userPublicKey The current user's public key for decryption
   * @returns The decrypted shareable data
   */
  async downloadSharedData(ipfsHash: string, userPublicKey: string): Promise<ShareableData> {
    try {
      console.log('📥 Downloading shared data from IPFS...');

      // Download from IPFS
      const encryptedPackage = await ipfsService.downloadEncryptedData(ipfsHash);
      
      // Parse the package
      const shareableData: ShareableData = JSON.parse(encryptedPackage);

      // Decrypt all entries for the current user
      const decryptedEntries = [];
      for (const entry of shareableData.entries) {
        try {
          const decrypted = await this.decryptFromRecipient(entry.encryptedData, userPublicKey);
          decryptedEntries.push({
            ...entry,
            decryptedData: decrypted
          });
        } catch (error) {
          console.warn('Failed to decrypt shared entry:', entry.entryId, error);
          // Keep the encrypted version if decryption fails
          decryptedEntries.push(entry);
        }
      }

      console.log('✅ Shared data downloaded and decrypted successfully');
      
      return {
        ...shareableData,
        entries: decryptedEntries
      };
    } catch (error) {
      console.error('❌ Failed to download shared data:', error);
      throw new Error(`Download failed: ${error}`);
    }
  }

  /**
   * Create a deterministic encryption key from a wallet address
   */
  private async createKeyFromAddress(address: string, salt: string = 'privycycle-sharing-v1'): Promise<CryptoKey> {
    // Normalize the address
    const normalizedAddress = address.toLowerCase();
    
    // Create key material from address + salt
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(normalizedAddress + salt),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive a proper encryption key
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode(salt),
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
   * Encrypt data for a specific recipient using their wallet address
   */
  async encryptForRecipient(data: string, recipientAddress: string): Promise<EncryptedData> {
    const salt = 'privycycle-sharing-v1';
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Create encryption key from recipient's address
    const key = await this.createKeyFromAddress(recipientAddress, salt);
    
    // Encrypt the data
    const encodedData = new TextEncoder().encode(data);
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );
    
    // Extract the encrypted data and tag
    const encryptedData = new Uint8Array(encryptedBuffer.slice(0, -16));
    const tag = new Uint8Array(encryptedBuffer.slice(-16));
    
    return {
      version: 'v1',
      salt: salt,
      iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
      data: Array.from(encryptedData).map(b => b.toString(16).padStart(2, '0')).join(''),
      tag: Array.from(tag).map(b => b.toString(16).padStart(2, '0')).join('')
    };
  }

  /**
   * Decrypt data that was encrypted for a specific wallet address
   */
  async decryptFromRecipient(encryptedData: EncryptedData, recipientAddress: string): Promise<string> {
    // Convert hex strings back to Uint8Arrays
    const iv = new Uint8Array(encryptedData.iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const data = new Uint8Array(encryptedData.data.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const tag = new Uint8Array(encryptedData.tag.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Create decryption key from recipient's address (same as encryption)
    const key = await this.createKeyFromAddress(recipientAddress, encryptedData.salt);
    
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
  }

  /**
   * Check if shared data is accessible
   * @param ipfsHash The IPFS hash to check
   * @returns True if accessible, false otherwise
   */
  async isSharedDataAccessible(ipfsHash: string): Promise<boolean> {
    return await ipfsService.isAccessible(ipfsHash);
  }

  /**
   * Get information about a shared data package
   * @param ipfsHash The IPFS hash to check
   * @returns File information or null if not found
   */
  async getSharedDataInfo(ipfsHash: string): Promise<{
    name: string;
    size: number;
    accessible: boolean;
  } | null> {
    try {
      const fileInfo = await ipfsService.getFileInfo(ipfsHash);
      if (!fileInfo) {
        return null;
      }

      const accessible = await this.isSharedDataAccessible(ipfsHash);

      return {
        name: fileInfo.name,
        size: fileInfo.size,
        accessible
      };
    } catch (error) {
      console.error('Failed to get shared data info:', error);
      return null;
    }
  }

  /**
   * Convert share type string to number for contract
   * @param shareType The share type string
   * @returns The corresponding number
   */
  private getShareTypeNumber(shareType: 'partner' | 'family' | 'doctor'): number {
    switch (shareType) {
      case 'partner': return 0;
      case 'family': return 1;
      case 'doctor': return 2;
      default: return 0;
    }
  }

  /**
   * Convert share type number to string
   * @param shareType The share type number
   * @returns The corresponding string
   */
  getShareTypeString(shareType: number): 'partner' | 'family' | 'doctor' {
    switch (shareType) {
      case 0: return 'partner';
      case 1: return 'family';
      case 2: return 'doctor';
      default: return 'partner';
    }
  }

  /**
   * Create a shareable link for the data
   * @param ipfsHash The IPFS hash
   * @param shareType The type of share
   * @returns A shareable URL
   */
  createShareableLink(ipfsHash: string, shareType: 'partner' | 'family' | 'doctor'): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared/${shareType}/${ipfsHash}`;
  }

  /**
   * Parse a shareable link to extract IPFS hash and share type
   * @param shareableLink The shareable link
   * @returns Parsed information or null if invalid
   */
  parseShareableLink(shareableLink: string): {
    ipfsHash: string;
    shareType: 'partner' | 'family' | 'doctor';
  } | null {
    try {
      const url = new URL(shareableLink);
      const pathParts = url.pathname.split('/');
      
      if (pathParts.length >= 4 && pathParts[1] === 'shared') {
        const shareType = pathParts[2] as 'partner' | 'family' | 'doctor';
        const ipfsHash = pathParts[3];
        
        if (['partner', 'family', 'doctor'].includes(shareType) && ipfsHash) {
          return { ipfsHash, shareType };
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }
}

// Export a singleton instance
export const sharingService = new SharingService();
