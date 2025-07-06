import { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyEncryption } from '../../lib/encryption/privyEncryption';
import { sharingService, type ShareResult, type ShareableData } from '../../lib/sharing/sharingService';
import type { EncryptedData } from '../../lib/encryption/privyEncryption';
import type { LogEntry } from '../../lib/types/cycle';

export interface ShareEntry {
  encryptedData: EncryptedData;
  timestamp: number;
  localTimestamp: number;
  entryId: number;
}

export interface UseSharing {
  shareData: (
    recipientPublicKey: string,
    shareType: 'partner' | 'family' | 'doctor',
    entries: LogEntry[]
  ) => Promise<ShareResult>;
  downloadSharedData: (ipfsHash: string, userPublicKey: string) => Promise<ShareableData>;
  isSharedDataAccessible: (ipfsHash: string) => Promise<boolean>;
  getSharedDataInfo: (ipfsHash: string) => Promise<{
    name: string;
    size: number;
    accessible: boolean;
  } | null>;
  createShareableLink: (ipfsHash: string, shareType: 'partner' | 'family' | 'doctor') => string;
  parseShareableLink: (link: string) => { ipfsHash: string; shareType: 'partner' | 'family' | 'doctor' } | null;
  getShareTypeString: (shareType: number) => 'partner' | 'family' | 'doctor';
  isLoading: boolean;
  error: string | null;
}

export const useSharing = (): UseSharing => {
  const { user } = usePrivy();
  const encryption = usePrivyEncryption();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareData = useCallback(async (
    recipientPublicKey: string,
    shareType: 'partner' | 'family' | 'doctor',
    entries: LogEntry[]
  ): Promise<ShareResult> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    if (!encryption.isReady) {
      throw new Error('Encryption service not ready');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert LogEntry[] to ShareEntry[] by encrypting each entry
      const shareEntries: ShareEntry[] = [];
      
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const encryptedData = await encryption.encrypt(JSON.stringify(entry));
        
        shareEntries.push({
          encryptedData,
          timestamp: entry.date.getTime(),
          localTimestamp: entry.date.getTime(),
          entryId: i + 1 // Use index + 1 as entryId
        });
      }

      const result = await sharingService.shareData(
        recipientPublicKey,
        shareType,
        shareEntries,
        {
          decrypt: encryption.decrypt.bind(encryption),
          encryptForRecipient: async (data: string, publicKey: string) => {
            // Use the sharing service's encryption method
            return sharingService.encryptForRecipient(data, publicKey);
          }
        },
        user.id
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, encryption]);

  const downloadSharedData = useCallback(async (
    ipfsHash: string,
    userPublicKey: string
  ): Promise<ShareableData> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sharingService.downloadSharedData(ipfsHash, userPublicKey);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download shared data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isSharedDataAccessible = useCallback(async (ipfsHash: string): Promise<boolean> => {
    try {
      return await sharingService.isSharedDataAccessible(ipfsHash);
    } catch (err) {
      console.error('Failed to check data accessibility:', err);
      return false;
    }
  }, []);

  const getSharedDataInfo = useCallback(async (ipfsHash: string) => {
    try {
      return await sharingService.getSharedDataInfo(ipfsHash);
    } catch (err) {
      console.error('Failed to get shared data info:', err);
      return null;
    }
  }, []);

  const createShareableLink = useCallback((
    ipfsHash: string,
    shareType: 'partner' | 'family' | 'doctor'
  ): string => {
    return sharingService.createShareableLink(ipfsHash, shareType);
  }, []);

  const parseShareableLink = useCallback((link: string) => {
    return sharingService.parseShareableLink(link);
  }, []);

  const getShareTypeString = useCallback((shareType: number): 'partner' | 'family' | 'doctor' => {
    return sharingService.getShareTypeString(shareType);
  }, []);

  return {
    shareData,
    downloadSharedData,
    isSharedDataAccessible,
    getSharedDataInfo,
    createShareableLink,
    parseShareableLink,
    getShareTypeString,
    isLoading,
    error
  };
};
