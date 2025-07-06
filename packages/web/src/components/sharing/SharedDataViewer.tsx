import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useSharing } from '../../hooks/sharing/useSharing';
import { useContractSharing } from '../../hooks/sharing/useContractSharing';
import type { ShareableData } from '../../lib/sharing/sharingService';
import type { ContractShare } from '../../hooks/sharing/useContractSharing';

interface SharedDataViewerProps {
  className?: string;
}

export const SharedDataViewer: React.FC<SharedDataViewerProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'shared-by-me' | 'shared-with-me'>('shared-with-me');
  const [myShares, setMyShares] = useState<ContractShare[]>([]);
  const [receivedShares, setReceivedShares] = useState<ContractShare[]>([]);
  const [selectedShare, setSelectedShare] = useState<ContractShare | null>(null);
  const [sharedData, setSharedData] = useState<ShareableData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sharing = useSharing();
  const contractSharing = useContractSharing();

  // Load shares on component mount
  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [mySharesData, receivedSharesData] = await Promise.all([
        contractSharing.getMyShares(),
        contractSharing.getSharedWithMe()
      ]);
      
      setMyShares(mySharesData);
      setReceivedShares(receivedSharesData);
    } catch (err) {
      console.error('Failed to load shares:', err);
      setError('Failed to load shared data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewShare = async (share: ContractShare): Promise<void> => {
    setSelectedShare(share);
    setSharedData(null);
    setError(null);
    setIsLoading(true);

    try {
      // For now, we'll use a placeholder public key
      // In a real app, you'd get this from the user's profile or wallet
      const userPublicKey = 'user-public-key-placeholder';
      
      const data = await sharing.downloadSharedData(share.ipfsHash, userPublicKey);
      setSharedData(data);
    } catch (err) {
      console.error('Failed to load shared data:', err);
      setError('Failed to decrypt shared data. You may not have the correct decryption key.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getShareTypeLabel = (shareType: number): string => {
    switch (shareType) {
      case 0: return 'Partner';
      case 1: return 'Family';
      case 2: return 'Doctor';
      default: return 'Unknown';
    }
  };

  const getShareTypeColor = (shareType: number): string => {
    switch (shareType) {
      case 0: return 'bg-pink-100 text-pink-800';
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Shared Data</h2>
        <Button onClick={loadShares} disabled={isLoading} variant="secondary">
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('shared-with-me')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shared-with-me'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Shared With Me ({receivedShares.length})
          </button>
          <button
            onClick={() => setActiveTab('shared-by-me')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shared-by-me'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Shared By Me ({myShares.length})
          </button>
        </nav>
      </div>

      {/* Shares List */}
      <div className="grid gap-4">
        {activeTab === 'shared-with-me' && (
          <>
            {receivedShares.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-500">No data has been shared with you yet.</p>
              </Card>
            ) : (
              receivedShares.map((share, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShareTypeColor(share.shareType)}`}>
                          {getShareTypeLabel(share.shareType)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(share.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        From: <span className="font-mono text-xs">{share.recipient}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        IPFS: <span className="font-mono text-xs">{share.ipfsHash.substring(0, 20)}...</span>
                      </p>
                    </div>
                    <Button
                      onClick={() => handleViewShare(share)}
                      size="sm"
                      disabled={isLoading}
                    >
                      View Data
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </>
        )}

        {activeTab === 'shared-by-me' && (
          <>
            {myShares.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-500">You haven't shared any data yet.</p>
              </Card>
            ) : (
              myShares.map((share, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShareTypeColor(share.shareType)}`}>
                          {getShareTypeLabel(share.shareType)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(share.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        To: <span className="font-mono text-xs">{share.recipient}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        IPFS: <span className="font-mono text-xs">{share.ipfsHash.substring(0, 20)}...</span>
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => copyToClipboard(sharing.createShareableLink(share.ipfsHash, sharing.getShareTypeString(share.shareType)))}
                        size="sm"
                        variant="secondary"
                      >
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </>
        )}
      </div>

      {/* Shared Data Modal */}
      {selectedShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Shared {getShareTypeLabel(selectedShare.shareType)} Data
              </h3>
              <button
                onClick={() => {
                  setSelectedShare(null);
                  setSharedData(null);
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Loading shared data...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {sharedData && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Share Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Shared by:</span>
                      <p className="font-mono text-xs">{sharedData.metadata.sharedBy}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Shared on:</span>
                      <p>{formatDate(sharedData.metadata.sharedAt / 1000)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total entries:</span>
                      <p>{sharedData.metadata.totalEntries}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Share type:</span>
                      <p>{sharedData.metadata.shareType}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Data Entries ({sharedData.entries.length})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {sharedData.entries.map((entry, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">Entry #{entry.entryId}</span>
                          <span className="text-xs text-gray-500">
                            {formatDate(entry.localTimestamp / 1000)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
                          {entry.encryptedData ? 'Encrypted data available' : 'Failed to decrypt'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
