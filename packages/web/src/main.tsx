import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import './index.css'
import App from './App.tsx'
import './test-gas-sponsorship'

// Development fallback for Privy app ID
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'clpispdty00ycl80fpueukbhl';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#B5485E',
        },
        // Enhanced embedded wallet configuration for seamless experience
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          showWalletUIs: false, // Hide wallet UIs for seamless experience
          requireUserPasswordOnCreate: false,
        },
        // Use Zircuit testnet for the hackathon
        defaultChain: {
          id: 48898, // Zircuit testnet (correct chain ID)
          name: 'Zircuit Testnet',
          network: 'zircuit-testnet',
          nativeCurrency: {
            decimals: 18,
            name: 'ETH',
            symbol: 'ETH',
          },
          rpcUrls: {
            default: {
              http: ['https://garfield-testnet.zircuit.com'],
            },
            public: {
              http: ['https://garfield-testnet.zircuit.com'],
            },
          },
          blockExplorers: {
            default: {
              name: 'Zircuit Explorer',
              url: 'https://explorer.testnet.zircuit.com',
            },
          },
        },
        supportedChains: [
          {
            id: 48898, // Zircuit testnet (correct chain ID)
            name: 'Zircuit Testnet',
            network: 'zircuit-testnet',
            nativeCurrency: {
              decimals: 18,
              name: 'ETH',
              symbol: 'ETH',
            },
            rpcUrls: {
              default: {
                http: ['https://garfield-testnet.zircuit.com'],
              },
              public: {
                http: ['https://garfield-testnet.zircuit.com'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Zircuit Explorer',
                url: 'https://explorer.testnet.zircuit.com',
              },
            },
          },
        ]
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
)
