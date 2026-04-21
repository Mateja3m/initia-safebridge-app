import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import { demoVideoUrl, heroMetrics } from "../lib/appConfig";
import WalletConnectButton from "./WalletConnectButton";

const metricIcons = {
  analytics: <AutoGraphRoundedIcon fontSize="small" />,
  rules: <RuleRoundedIcon fontSize="small" />,
  network: <HubRoundedIcon fontSize="small" />,
};

export default function AppShell({
  children,
  wallet,
  isConnected,
  onConnectWallet,
  onOpenWallet,
  onDisconnectWallet,
  statusItems,
  currentDemoStep,
}) {
  const demoSteps = [
    "Configure route",
    "Run validation",
    "Review confidence",
    "Execute transfer",
    "Review handoff",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#EEF3FB",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          pt: { xs: 1.75, md: 4.5 },
          pb: { xs: 2, md: 2.5 },
          px: { xs: 1.5, sm: 3, md: 3 },
        }}
      >
        <Stack spacing={{ xs: 1.4, md: 2.25 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "flex-start" }}
            justifyContent="space-between"
            spacing={{ xs: 1.1, md: 2.5 }}
            sx={{
              px: { xs: 0, md: 0 },
              py: 0.5,
            }}
          >
            <Stack spacing={{ xs: 0.55, md: 0.9 }} sx={{ maxWidth: 780, flex: 1, width: '100%' }}>
              <Typography
                variant="h1"
                sx={{
                  maxWidth: { xs: 220, md: 390 },
                  color: "#123B68",
                  paddingBottom: { xs: 0.35, md: 1.1 },
                  fontSize: { xs: '3rem', sm: '3.8rem', md: undefined },
                  lineHeight: { xs: 0.98, md: 0.95 },
                }}
              >
                SafeBridge
              </Typography>

              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ pb: { xs: 0.15, md: 0.35 } }}>
                <Chip label="INITIA WORKSTATION" color="primary" size="small" />
                <Chip label="VALIDATE FIRST" variant="outlined" size="small" />
              </Stack>

              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ maxWidth: 760, fontSize: { xs: '0.98rem', md: undefined }, lineHeight: { xs: 1.35, md: 1.45 } }}
              >
                Check the route before you submit it.
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 660, fontSize: { xs: '0.84rem', md: undefined }, lineHeight: { xs: 1.45, md: 1.55 } }}
              >
                Live RPC checks, route discovery, and bridge handoff stay on one screen.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 0.35 }}>
                <Button
                  component="a"
                  href={demoVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  size="small"
                  endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Watch demo
                </Button>
              </Stack>
            </Stack>

            <WalletConnectButton
              wallet={wallet}
              isConnected={isConnected}
              onConnect={onConnectWallet}
              onOpenWallet={onOpenWallet}
              onDisconnect={onDisconnectWallet}
            />
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0}
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", sm: "block" } }}
              />
            }
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              backgroundColor: "background.paper",
              maxWidth: 1120,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
            }}
          >
            {statusItems.map((item) => (
              <Stack
                key={item.label}
                spacing={0.45}
                sx={{
                  minWidth: 0,
                  flex: 1,
                  px: { xs: 1.35, sm: 1.6 },
                  py: 1.15,
                  borderBottom: { xs: '1px solid', sm: 'none' },
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Typography variant="overline" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    letterSpacing: "-0.02em",
                    whiteSpace: { xs: 'normal', sm: "nowrap" },
                    overflow: "hidden",
                    textOverflow: { xs: 'clip', sm: "ellipsis" },
                    maxWidth: "100%",
                    fontFamily:
                      item.label === "Last tx hash" ? '"Roboto Mono", "SFMono-Regular", monospace' : undefined,
                    fontSize: item.label === "Last tx hash" ? "0.95rem" : undefined,
                    lineHeight: { xs: 1.3, sm: 1.25 },
                    wordBreak: item.label === 'Last tx hash' ? 'break-all' : 'normal',
                  }}
                >
                  {item.value}
                </Typography>
                {item.caption ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                      fontFamily:
                        item.label === "Last tx hash" || item.label === "Execution mode"
                          ? '"Roboto Mono", "SFMono-Regular", monospace'
                          : undefined,
                      fontSize: { xs: '0.68rem', sm: undefined },
                    }}
                  >
                    {item.caption}
                  </Typography>
                ) : null}
              </Stack>
            ))}
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", md: "center" }}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              backgroundColor: "#F7FAFF",
              px: { xs: 1, md: 1.35 },
              py: { xs: 0.85, md: 1 },
              maxWidth: 1220,
              ml: { md: 2 },
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ minWidth: { xs: 'auto', md: 118 }, mb: { xs: 0.2, md: 0 } }}
            >
              Demo flow
            </Typography>
            <Stack
              direction="row"
              spacing={{ xs: 0.55, md: 0.9 }}
              flexWrap="wrap"
              useFlexGap
              sx={{ flex: 1 }}
            >
              {demoSteps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = currentDemoStep === stepNumber;
                const isComplete = currentDemoStep > stepNumber;

                return (
                  <Chip
                    key={step}
                    size="small"
                    label={`${stepNumber}. ${step}`}
                    color={isActive || isComplete ? "primary" : "default"}
                    variant={isActive || isComplete ? "filled" : "outlined"}
                    sx={{
                      backgroundColor:
                        isActive || isComplete ? "primary.main" : undefined,
                      color:
                        isActive || isComplete
                          ? "primary.contrastText"
                          : undefined,
                      minWidth: { xs: "auto", md: 0 },
                      justifyContent: "center",
                      flex: { md: 1 },
                      px: { md: 1.1 },
                      '& .MuiChip-label': {
                        px: { xs: 1.05, md: undefined },
                        fontSize: { xs: '0.74rem', md: undefined },
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0}
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", sm: "block" } }}
              />
            }
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              maxWidth: 760,
              pt: { xs: 0.5, md: 0.75 },
              ml: { md: 1.5 },
            }}
          >
            {heroMetrics.map((metric) => (
              <Stack
                key={metric.label}
                spacing={0.55}
                sx={{ minWidth: 0, flex: 1, px: { sm: 1.5 }, py: { xs: 0.4, md: 0.5 } }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.72rem', md: undefined } }}>
                    {metric.label}
                  </Typography>
                </Stack>
                <Typography
                  variant="subtitle1"
                  sx={{ letterSpacing: "-0.02em" }}
                >
                  {metric.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: undefined } }}>
                  {metric.hint}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {children}
        </Stack>
      </Container>
    </Box>
  );
}
