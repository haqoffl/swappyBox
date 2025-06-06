'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

  if (!appId || !clientId) {
    throw new Error('Missing PRIVY_APP_ID or PRIVY_CLIENT_ID env vars');
  }

  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
        supportedChains: [
          {
            id: 420420421, // Replace with the actual chain ID
            name: 'Westend Asset Hub',
            nativeCurrency: {
              name: 'Paseo Token',
              symbol: 'WND',
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: ['https://testnet-passet-hub-eth-rpc.polkadot.io/'], // Replace with actual RPC
              },
            },
            blockExplorers: {
              default: {
                name: 'Paseo Explorer',
                url: 'https://blockscout-passet-hub.parity-testnet.parity.io/', // Replace with actual explorer
              },
            },
            testnet: true,
          },
        ],

        defaultChain: {
          id: 420420421, // Replace with the actual chain ID
          name: 'Westend Asset Hub',
          nativeCurrency: {
            name: 'Paseo Token',
            symbol: 'WND',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ['https://testnet-passet-hub-eth-rpc.polkadot.io/'], // Replace with actual RPC
            },
          },
          blockExplorers: {
            default: {
              name: 'Paseo Explorer',
              url: 'https://blockscout-passet-hub.parity-testnet.parity.io/', // Replace with actual explorer
            },
          },
          testnet: true,
        },
        loginMethods: ['email', 'wallet', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: '/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
