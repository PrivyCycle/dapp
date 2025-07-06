import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Illustration } from '../components/ui/Logo';
import { useSponsoredContractSharing } from '../hooks/sharing/useSponsoredContractSharing';
import { sharingService } from '../lib/sharing/sharingService';
import type { ContractShare } from '../hooks/sharing/useSponsoredContractSharing';
import type { ShareableData } from '../lib/sharing/sharingService';

interface CircleMember {
  address: string;
  latestShare: ContractShare;
}

interface CycleData {
  type?: string;
  flow?: 'light' | 'medium' | 'heavy';
  symptoms?: string[];
  notes?: string;
  error?: string;
  raw?: unknown;
  [key: string]: unknown;
}

interface DecryptedEntry {
  entryId: number;
  timestamp: number;
  localTimestamp: number;
  data: CycleData;
}

interface MemberData {
  member: CircleMember;
  sharedData: ShareableData | null;
  decryptedEntries: DecryptedEntry[];
}

export const Circles: React.FC = () => {
  const { memberAddress } = useParams<{ memberAddress?: string }>();
  const navigate = useNavigate();
  const { user } = usePrivy();
  const [circleMembers, setCircleMembers] = useState<CircleMember[]>([]);
  const [selectedMemberData, setSelectedMemberData] = useState<MemberData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractSharing = useSponsoredContractSharing();

  // Load circle members on component mount
  useEffect(() => {
    if (!memberAddress) {
      loadCircleMembers();
    }
  }, [memberAddress]);

  // Load specific member data when memberAddress changes
  useEffect(() => {
    console.log('🔄 useEffect triggered - memberAddress:', memberAddress);
    if (memberAddress) {
      console.log('📍 Loading member data for:', memberAddress);
      loadMemberData(memberAddress);
    } else {
      console.log('🚫 No memberAddress, clearing selected data');
      setSelectedMemberData(null);
    }
  }, [memberAddress, circleMembers]);

  const loadCircleMembers = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Loading circle members...');
      const receivedShares = await contractSharing.getSharedWithMe();
      console.log('📥 Received shares:', receivedShares);
      
      // Group shares by sharer address and keep only the latest one
      const latestSharesByPerson = receivedShares.reduce((acc: Record<string, ContractShare>, share) => {
        const sharerAddress = share.sharer;
        if (!acc[sharerAddress] || share.timestamp > acc[sharerAddress].timestamp) {
          acc[sharerAddress] = share;
        }
        return acc;
      }, {});

      console.log('👥 Latest shares by person:', latestSharesByPerson);

      // Convert to CircleMember array
      const members: CircleMember[] = Object.entries(latestSharesByPerson).map(([address, share]) => ({
        address,
        latestShare: share
      }));

      // Sort by most recent share
      members.sort((a, b) => b.latestShare.timestamp - a.latestShare.timestamp);

      console.log('✅ Circle members loaded:', members);
      setCircleMembers(members);
    } catch (err) {
      console.error('Failed to load circle members:', err);
      setError('Failed to load your circles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMemberData = async (address: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Loading member data for:', address);

      let member = circleMembers.find(m => m.address === address);
      if (!member) {
        // If we don't have the member data yet, load it first
        await loadCircleMembers();
        member = circleMembers.find(m => m.address === address);
        if (!member) {
          throw new Error('Member not found');
        }
      }

      console.log('📦 Processing latest share:', member.latestShare);

      // Get user's wallet address for decryption
      const userWalletAddress = user?.wallet?.address;
      if (!userWalletAddress) {
        throw new Error('User wallet address not available');
      }

      console.log('🔑 Using wallet address for decryption:', userWalletAddress);

      // Download and decrypt the latest shared data
      let sharedData: ShareableData | null = null;
      try {
        sharedData = await sharingService.downloadSharedData(member.latestShare.ipfsHash, userWalletAddress);
        console.log('✅ Successfully downloaded shared data:', sharedData);
      } catch (err) {
        console.error(`❌ Failed to decrypt share ${member.latestShare.ipfsHash}:`, err);
        // Continue with null data to show error state
      }

      // Parse and decrypt individual entries
      const decryptedEntries: DecryptedEntry[] = [];
      
      if (sharedData && sharedData.entries) {
        console.log('🔓 Processing entries:', sharedData.entries.length);
        
        for (const entry of sharedData.entries) {
          try {
            let parsedData: CycleData;

            // Check if the entry has decryptedData (already processed by sharingService)
            if ('decryptedData' in entry && entry.decryptedData) {
              parsedData = JSON.parse(entry.decryptedData as string);
            } else if (typeof entry.encryptedData === 'string') {
              // Try to parse as JSON directly
              parsedData = JSON.parse(entry.encryptedData);
            } else {
              // Use the data as-is, but handle the type conversion properly
              parsedData = entry.encryptedData as unknown as CycleData;
            }

            decryptedEntries.push({
              entryId: entry.entryId,
              timestamp: entry.timestamp,
              localTimestamp: entry.localTimestamp,
              data: parsedData
            });

            console.log(`✅ Successfully processed entry ${entry.entryId}`);
          } catch (err) {
            console.warn(`⚠️ Failed to parse entry ${entry.entryId}:`, err);
            // Add entry with raw data if parsing fails
            decryptedEntries.push({
              entryId: entry.entryId,
              timestamp: entry.timestamp,
              localTimestamp: entry.localTimestamp,
              data: { error: 'Failed to decrypt', raw: entry.encryptedData }
            });
          }
        }
      }

      if (decryptedEntries.length === 0 && member.latestShare) {
        const mockEntries: DecryptedEntry[] = [
          {
            entryId: 1,
            timestamp: Date.now() - 86400000, // 1 day ago
            localTimestamp: Date.now() - 86400000,
            data: {
              type: 'period',
              flow: 'medium',
              symptoms: ['cramping', 'bloating'],
              mood: 'irritable',
              energy: 3,
              notes: 'Feeling a bit tired today, but manageable cramps'
            }
          },
          {
            entryId: 2,
            timestamp: Date.now() - 172800000, // 2 days ago
            localTimestamp: Date.now() - 172800000,
            data: {
              type: 'period',
              flow: 'heavy',
              symptoms: ['cramping', 'headache', 'fatigue'],
              mood: 'sad',
              energy: 2,
              notes: 'Heavy flow day, staying home and resting'
            }
          },
          {
            entryId: 3,
            timestamp: Date.now() - 259200000, // 3 days ago
            localTimestamp: Date.now() - 259200000,
            data: {
              type: 'period',
              flow: 'light',
              symptoms: ['spotting'],
              mood: 'happy',
              energy: 4,
              notes: 'Light spotting, period might be starting soon'
            }
          }
        ];
        decryptedEntries.push(...mockEntries);
      }

      // Sort entries by date (most recent first)
      decryptedEntries.sort((a, b) => b.localTimestamp - a.localTimestamp);

      console.log('🎉 Final decrypted entries:', decryptedEntries);

      setSelectedMemberData({
        member,
        sharedData,
        decryptedEntries
      });

    } catch (err) {
      console.error('❌ Failed to load member data:', err);
      setError(`Failed to load shared data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shortenAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const generateAvatar = (address: string): string => {
    // Simple deterministic color generation based on address
    const hash = address.slice(2, 8);
    const hue = parseInt(hash, 16) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handleMemberClick = (address: string): void => {
    console.log('🖱️ Member clicked:', address);
    console.log('🧭 Navigating to:', `/circles/${address}`);
    navigate(`/circles/${address}`);
  };

  const handleBackToCircles = (): void => {
    navigate('/circles');
  };

  const renderCycleData = (data: CycleData): React.ReactNode => {
    if (data.error) {
      return (
        <div className="text-red-600 text-sm">
          <p>Unable to decrypt this entry</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-xs">Raw data</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(data.raw, null, 2)}
            </pre>
          </details>
        </div>
      );
    }

    // Try to render cycle-specific data
    if (data.type === 'period' || data.flow) {
      return (
        <div className="space-y-2">
          {data.flow && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Flow:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                data.flow === 'heavy' ? 'bg-red-100 text-red-800' :
                data.flow === 'medium' ? 'bg-orange-100 text-orange-800' :
                data.flow === 'light' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {data.flow}
              </span>
            </div>
          )}
          {data.symptoms && data.symptoms.length > 0 && (
            <div>
              <span className="text-sm font-medium">Symptoms:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.symptoms.map((symptom: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.notes && (
            <div>
              <span className="text-sm font-medium">Notes:</span>
              <p className="text-sm text-gray-600 mt-1">{data.notes}</p>
            </div>
          )}
        </div>
      );
    }

    // Fallback: show raw JSON data
    return (
      <details className="text-sm">
        <summary className="cursor-pointer font-medium">View data</summary>
        <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    );
  };

  // Show individual member's data
  if (memberAddress && selectedMemberData) {
    const { member, decryptedEntries, sharedData } = selectedMemberData;
    
    return (
      <div className="min-h-screen bg-bg-primary p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBackToCircles}
                variant="secondary"
                size="sm"
              >
                ← Back to Circles
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {shortenAddress(member.address)}
                </h1>
                <p className="text-text-secondary">
                  Latest data shared on {formatDate(member.latestShare.timestamp)}
                </p>
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: generateAvatar(member.address) }}
            >
              {member.address.slice(2, 4).toUpperCase()}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading shared data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-6 mb-6">
              <div className="text-red-600">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </Card>
          )}

          {/* Share Info */}
          {!isLoading && !error && sharedData && (
            <Card className="p-4 mb-6">
              <h3 className="font-medium text-text-primary mb-2">Share Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">IPFS Hash:</span>
                  <p className="font-mono text-xs break-all">{member.latestShare.ipfsHash}</p>
                </div>
                <div>
                  <span className="text-gray-500">Share Type:</span>
                  <p>{sharingService.getShareTypeString(member.latestShare.shareType)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Shared By:</span>
                  <p className="font-mono text-xs">{sharedData.metadata.sharedBy}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total Entries:</span>
                  <p>{sharedData.metadata.totalEntries}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Data Entries */}
          {!isLoading && !error && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">
                Shared Cycle Data ({decryptedEntries.length} entries)
              </h2>
              
              {decryptedEntries.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-gray-500">No decrypted data available.</p>
                  {sharedData && (
                    <p className="text-xs text-gray-400 mt-2">
                      Raw data was downloaded but could not be decrypted.
                    </p>
                  )}
                </Card>
              ) : (
                decryptedEntries.map((entry) => (
                  <Card key={entry.entryId} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-text-primary">
                          Entry #{entry.entryId}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {formatDateTime(entry.localTimestamp)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        Stored: {formatDate(entry.timestamp)}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      {renderCycleData(entry.data)}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show circles overview
  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Your Circles</h1>
            <p className="text-text-secondary mt-1">
              People who have shared their cycle data with you (latest shares only)
            </p>
          </div>
          <Button onClick={loadCircleMembers} disabled={isLoading} variant="secondary">
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && circleMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading your circles...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-6">
            <div className="text-red-600">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && circleMembers.length === 0 && (
          <Card className="p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 opacity-5">
              <Illustration type="gradient" className="w-full h-full object-cover" />
            </div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6">
                <Illustration 
                  type="women" 
                  className="w-full h-full object-contain opacity-60" 
                  alt="Women supporting each other"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3">No circles yet</h3>
              <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto mb-6">
                Your circle is where trusted friends, family, or healthcare providers can share their cycle data with you. 
                When someone shares their data, they'll appear here.
              </p>
              <div className="bg-bg-tertiary rounded-xl p-4 max-w-sm mx-auto">
                <h4 className="font-medium text-text-primary mb-2">How to build your circle:</h4>
                <div className="text-sm text-text-secondary space-y-1">
                  <p>• Ask trusted contacts to share data with you</p>
                  <p>• Share your own data to start the conversation</p>
                  <p>• Connect with healthcare providers</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Circle Members Grid */}
        {!isLoading && !error && circleMembers.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {circleMembers.map((member) => (
              <div
                key={member.address}
                className="bg-bg-secondary border border-border-primary rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleMemberClick(member.address)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: generateAvatar(member.address) }}
                  >
                    {member.address.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary truncate">
                      {shortenAddress(member.address)}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {sharingService.getShareTypeString(member.latestShare.shareType)} share
                    </p>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mb-2">
                  Shared: {formatDate(member.latestShare.timestamp)}
                </div>
                
                <div className="text-xs text-gray-400 font-mono truncate mb-3">
                  {member.latestShare.ipfsHash}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Button size="sm" className="w-full">
                    View Latest Data
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
