import { Button, Chip, Stack, Typography } from '@mui/material';

export default function WalletConnectButton({
  wallet,
  isConnected,
  onConnect,
  onOpenWallet,
  onDisconnect,
}) {
  return (
    <Stack spacing={2} alignItems={{ xs: "stretch", md: "flex-end" }}>
      <Button
        variant="contained"
        size="large"
        onClick={isConnected ? onOpenWallet : onConnect}
        sx={{
          minWidth: 196,
          px: 2.75,
          pt: 1.05,
          borderRadius: 1.5,
          border: "1px solid rgba(38, 64, 128, 0.12)",
          boxShadow: "none",
          pb: 1.05,
        }}
      >
        {isConnected ? wallet.displayAddress : "Connect Wallet"}
      </Button>

      <Stack
        direction="row"
        spacing={0.8}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
      >
        <Chip
          size="small"
          label={isConnected ? "CONNECTED" : "DISCONNECTED"}
          color={isConnected ? "success" : "default"}
          variant="outlined"
        />
        <Typography variant="caption" color="text.secondary">
          {isConnected
            ? wallet.username || "Initia signer session active"
            : "OKX Wallet via InterwovenKit"}
        </Typography>
        {isConnected ? (
          <Button
            variant="text"
            size="small"
            color="inherit"
            onClick={onDisconnect}
            sx={{
              minWidth: "auto",
              minHeight: 0,
              px: 0.5,
              py: 0,
              fontSize: "0.75rem",
              color: "text.secondary",
            }}
          >
            Disconnect
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
