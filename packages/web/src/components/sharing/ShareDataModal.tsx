import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useSharing } from '../../hooks/sharing/useSharing';
import { useContractSharing } from '../../hooks/sharing/useContractSharing';
import type { LogEntry } from '../../lib/types/cycle';

// Test recipient key generated for development/testing
const TEST_RECIPIENT_ADDRESS = '0x26b4afcF397255499F1aDFFFfeBD015F6CdbA10a';

interface ShareDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LogEntry[];
  onShareComplete?: (result: { ipfsHash: string; txHash: string; shareableLink: string }) => void;
}

export const ShareDataModal: React.FC<ShareDataModalProps> = ({
  isOpen,
  onClose,
  entries,
  onShareComplete
}) => {
  const [recipientAddress, setRecipientAddress] = useState(TEST_RECIPIENT_ADDRESS);
  const [shareType, setShareType] = useState<'partner' | 'family' | 'doctor'>('partner');
  const [step, setStep] = useState<'form' | 'sharing' | 'success' | 'error'>('form');
  const [result, setResult] = useState<{ ipfsHash: string; txHash: string; shareableLink: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sharing = useSharing();
  const contractSharing = useContractSharing();

  const handleShare = async (): Promise<void> => {
    if (!recipientAddress || entries.length === 0) {
      setError('Please provide a recipient address');
      return;
    }

    setStep('sharing');
    setError(null);

    try {
      // Step 1: Share data to IPFS
      console.log('🔄 Sharing data to IPFS...');
      // Use the same address for both encryption and blockchain transaction
      const shareResult = await sharing.shareData(recipientAddress, shareType, entries);
      
      // Step 2: Record the share on the blockchain
      console.log('🔄 Recording share on blockchain...');
      const txHash = await contractSharing.shareDataOnChain(
        recipientAddress,
        shareResult.ipfsHash,
        shareType
      );

      // Step 3: Create shareable link
      const shareableLink = sharing.createShareableLink(shareResult.ipfsHash, shareType);

      const finalResult = {
        ipfsHash: shareResult.ipfsHash,
        txHash,
        shareableLink
      };

      setResult(finalResult);
      setStep('success');
      
      if (onShareComplete) {
        onShareComplete(finalResult);
      }
    } catch (err) {
      console.error('❌ Share failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to share data');
      setStep('error');
    }
  };

  const handleClose = (): void => {
    setStep('form');
    setRecipientAddress(TEST_RECIPIENT_ADDRESS);
    setShareType('partner');
    setResult(null);
    setError(null);
    onClose();
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share Cycle Data</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {step === 'form' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Share Type
              </label>
              <select
                value={shareType}
                onChange={(e) => setShareType(e.target.value as 'partner' | 'family' | 'doctor')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="partner">Partner</option>
                <option value="family">Family Member</option>
                <option value="doctor">Doctor/Healthcare Provider</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                The recipient's wallet address (used for both encryption and blockchain transaction)
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Pre-filled with test recipient address for development
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Sharing {entries.length} entries</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your data will be encrypted with the recipient's address and stored on IPFS
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={handleClose}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={!recipientAddress || entries.length === 0}
                className="flex-1"
              >
                Share Data
              </Button>
            </div>
          </div>
        )}

        {step === 'sharing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Sharing Your Data</h3>
            <p className="text-sm text-gray-600">
              Encrypting data and uploading to IPFS...
            </p>
            {contractSharing.isLoading && (
              <p className="text-sm text-gray-600 mt-2">
                Recording share on blockchain...
              </p>
            )}
          </div>
        )}

        {step === 'success' && result && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Data Shared Successfully!</h3>
              <p className="text-sm text-gray-600">
                Your cycle data has been securely shared
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  IPFS Hash
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={result.ipfsHash}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(result.ipfsHash)}
                    className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Transaction Hash
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={result.txHash}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(result.txHash)}
                    className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Shareable Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={result.shareableLink}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(result.shareableLink)}
                    className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">✕</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Share Failed</h3>
            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}
            <div className="flex space-x-3">
              <Button
                onClick={() => setStep('form')}
                variant="secondary"
                className="flex-1"
              >
                Try Again
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
