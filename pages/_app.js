import { useEffect, useState } from 'react';
import Head from 'next/head';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import {
  injectStyles,
  InterwovenKitProvider,
  TESTNET,
} from '@initia/interwovenkit-react';
import InterwovenKitStyles from '@initia/interwovenkit-react/styles.js';
import theme from '../styles/theme';
import '../styles/globals.css';

const queryClient = new QueryClient();
const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

function SafeBridgeProviders({ children }) {
  const [stylesReady, setStylesReady] = useState(false);

  useEffect(() => {
    injectStyles(InterwovenKitStyles);
    setStylesReady(true);
  }, []);

  if (!stylesReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <InterwovenKitProvider {...TESTNET} defaultChainId="initiation-2">
          {children}
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default function SafeBridgeApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>SafeBridge</title>
        <meta
          name="description"
          content="SafeBridge is an Initia hackathon demo for reliability-aware transaction feasibility and safer cross-rollup transfers."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SafeBridgeProviders>
          <Component {...pageProps} />
        </SafeBridgeProviders>
      </ThemeProvider>
    </>
  );
}
