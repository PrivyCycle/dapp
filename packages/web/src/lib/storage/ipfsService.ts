import { PinataSDK } from "pinata";

// IPFS service for uploading and downloading encrypted data packages using Pinata SDK
class IPFSService {
  private pinata: PinataSDK | null = null;
  private gateway: string;

  constructor() {
    this.gateway = import.meta.env.VITE_PINATA_GATEWAY || 'gateway.pinata.cloud';
  }

  /**
   * Initialize the Pinata SDK
   */
  private getPinata(): PinataSDK {
    if (!this.pinata) {
      const jwt = import.meta.env.VITE_PINATA_JWT;
      
      if (!jwt) {
        throw new Error('Pinata JWT not configured. Please set VITE_PINATA_JWT environment variable.');
      }

      this.pinata = new PinataSDK({
        pinataJwt: jwt,
        pinataGateway: this.gateway,
      });
    }
    return this.pinata;
  }

  /**
   * Upload encrypted data package to IPFS via Pinata
   * @param encryptedData The encrypted data package as a JSON string
   * @param filename Optional filename for the data package
   * @returns IPFS hash (CID) of the uploaded data
   */
  async uploadEncryptedData(encryptedData: string, filename?: string): Promise<string> {
    try {
      console.log('📤 Uploading encrypted data to IPFS via Pinata SDK...');
      
      const pinata = this.getPinata();
      
      // Create a File object from the encrypted data
      const file = new File(
        [encryptedData], 
        filename || `cycle-data-${Date.now()}.json`,
        { type: 'application/json' }
      );
      
      console.log('📤 Making request to Pinata API via SDK...');
      
      // Upload using the new SDK with correct API
      const upload = await pinata.upload.public
        .file(file)
        .name(`cycle-data-share-${Date.now()}`)
        .keyvalues({
          type: 'cycle-data-share',
          timestamp: Date.now().toString()
        });
      
      console.log('✅ Data uploaded to IPFS with CID:', upload.cid);
      return upload.cid;
    } catch (error) {
      console.error('❌ Failed to upload to IPFS:', error);
      throw new Error(`IPFS upload failed: ${error}`);
    }
  }

  /**
   * Download encrypted data package from IPFS via Pinata gateway
   * @param cid The IPFS hash (CID) of the data package
   * @returns The encrypted data as a string
   */
  async downloadEncryptedData(cid: string): Promise<string> {
    try {
      console.log('📥 Downloading encrypted data from IPFS:', cid);
      
      const pinata = this.getPinata();
      
      // Use the SDK's gateway method to fetch the data
      const response = await pinata.gateways.public.get(cid);
      
      console.log('✅ Data downloaded from IPFS successfully');
      return response.data as string;
    } catch (error) {
      console.error('❌ Failed to download from IPFS:', error);
      throw new Error(`IPFS download failed: ${error}`);
    }
  }

  /**
   * Check if a CID is accessible on IPFS
   * @param cid The IPFS hash to check
   * @returns True if accessible, false otherwise
   */
  async isAccessible(cid: string): Promise<boolean> {
    try {
      const gatewayUrl = `https://${this.gateway}/ipfs/${cid}`;
      const response = await fetch(gatewayUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get information about uploaded files
   * @returns Array of file information
   */
  async listFiles(): Promise<Array<{ cid: string; name: string; size: number; timestamp: string }>> {
    try {
      const pinata = this.getPinata();
      
      const files = await pinata.files.public
        .list()
        .keyvalues({ type: 'cycle-data-share' })
        .limit(100);
      
      return files.files?.map((file) => ({
        cid: file.cid || '',
        name: file.name || 'Unknown',
        size: file.size || 0,
        timestamp: file.created_at || ''
      })) || [];
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  /**
   * Delete/unpin a file from IPFS
   * @param cid The IPFS hash to unpin
   * @returns True if successful, false otherwise
   */
  async deleteFile(cid: string): Promise<boolean> {
    try {
      const pinata = this.getPinata();
      
      await pinata.files.public.delete([cid]);
      
      console.log('✅ File deleted from IPFS:', cid);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      return false;
    }
  }

  /**
   * Create a shareable IPFS gateway URL for a CID
   * @param cid The IPFS hash
   * @returns Gateway URL for accessing the data
   */
  getGatewayUrl(cid: string): string {
    return `https://${this.gateway}/ipfs/${cid}`;
  }

  /**
   * Get file information by CID
   * @param cid The IPFS hash to check
   * @returns File information or null if not found
   */
  async getFileInfo(cid: string): Promise<{ name: string; size: number; pinned: boolean } | null> {
    try {
      const pinata = this.getPinata();
      
      const files = await pinata.files.public
        .list()
        .cid(cid)
        .limit(1);
      
      if (files.files && files.files.length > 0) {
        const file = files.files[0];
        return {
          name: file.name || 'Unknown',
          size: file.size || 0,
          pinned: true
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Could not get file info:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const ipfsService = new IPFSService();

// Export types for use in other modules
export interface IPFSUploadResult {
  cid: string;
  gatewayUrl: string;
  size: number;
}

export interface IPFSDownloadResult {
  content: string;
  size: number;
  filename: string;
}

export interface IPFSFileInfo {
  cid: string;
  name: string;
  size: number;
  timestamp: string;
  pinned: boolean;
}
