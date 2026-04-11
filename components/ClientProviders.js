import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  injectStyles,
  InterwovenKitProvider,
  TESTNET,
} from '@initia/interwovenkit-react';
import InterwovenKitStyles from '@initia/interwovenkit-react/styles.js';

const queryClient = new QueryClient();

export default function ClientProviders({ children }) {
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
      <InterwovenKitProvider {...TESTNET} defaultChainId="initiation-2">
        {children}
      </InterwovenKitProvider>
    </QueryClientProvider>
  );
}
