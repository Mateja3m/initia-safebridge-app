import { Button, Chip, Stack } from '@mui/material';

export default function WalletConnectButton({
  wallet,
  isConnected,
  onConnect,
  onOpenWallet,
  onDisconnect,
}) {
  return (
    <Stack
      spacing={{ xs: 1.1, md: 2 }}
      alignItems={{ xs: 'stretch', md: 'flex-end' }}
      sx={{ width: { xs: '100%', md: 'auto' } }}
    >
      <Button
        variant="contained"
        size="large"
        onClick={isConnected ? onOpenWallet : onConnect}
        sx={{
          minWidth: { xs: '100%', md: 196 },
          width: { xs: '100%', md: 'auto' },
          px: { xs: 2, md: 2.75 },
          pt: 1.05,
          borderRadius: 1.5,
          border: '1px solid rgba(38, 64, 128, 0.12)',
          boxShadow: 'none',
          pb: 1.05,
        }}
      >
        {isConnected ? wallet.displayAddress : 'Connect Wallet'}
      </Button>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 0.45, md: 0.8 }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        flexWrap="wrap"
        useFlexGap
        sx={{ width: { xs: '100%', md: 'auto' } }}
      >
        <Chip
          size="small"
          label={isConnected ? "CONNECTED" : "DISCONNECTED"}
          color={isConnected ? "success" : "default"}
          variant="outlined"
        />
        {isConnected ? (
          <Button
            variant="text"
            size="small"
            color="inherit"
            onClick={onDisconnect}
            sx={{
              minWidth: 'auto',
              minHeight: 0,
              px: { xs: 0, md: 0.5 },
              py: 0,
              fontSize: '0.75rem',
              color: 'text.secondary',
            }}
          >
            Disconnect
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
