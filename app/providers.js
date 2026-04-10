'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import ClientProviders from '../components/ClientProviders';
import theme from '../styles/theme';

export default function Providers({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ClientProviders>{children}</ClientProviders>
    </ThemeProvider>
  );
}
