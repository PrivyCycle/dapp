import { gasSponsorshipService } from './lib/gasSponsorship/sponsorshipService';

// Test gas sponsorship initialization
async function testGasSponsorship(): Promise<void> {
  console.log('=== GAS SPONSORSHIP TEST ===');
  
  const sponsorPrivateKey = import.meta.env.VITE_SPONSOR_PRIVATE_KEY;
  console.log('Sponsor private key configured:', !!sponsorPrivateKey);
  
  if (!sponsorPrivateKey) {
    console.error('❌ No sponsor private key found in environment');
    return;
  }
  
  try {
    console.log('🔄 Initializing gas sponsorship service...');
    await gasSponsorshipService.initialize(sponsorPrivateKey);
    
    console.log('✅ Gas sponsorship service initialized successfully');
    console.log('Sponsor address:', gasSponsorshipService.getSponsorAddress());
    console.log('Service ready:', gasSponsorshipService.isReady());
    
    const balance = await gasSponsorshipService.getSponsorBalance();
    console.log('Sponsor balance:', balance, 'ETH');
    
  } catch (error) {
    console.error('❌ Gas sponsorship initialization failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  (window as typeof window & {
    testGasSponsorship: typeof testGasSponsorship;
  }).testGasSponsorship = testGasSponsorship;
}

export { testGasSponsorship };
