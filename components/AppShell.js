import {
  Box,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import { heroMetrics } from "../lib/appConfig";
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
    "Inspect outcome",
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
          pt: { xs: 3, md: 4.5 },
          pb: { xs: 2, md: 2.5 },
        }}
      >
        <Stack spacing={2.25}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "flex-start" }}
            justifyContent="space-between"
            spacing={2.5}
            sx={{
              px: { xs: 0.5, md: 0 },
              py: 0.5,
            }}
          >
            <Stack spacing={0.9} sx={{ maxWidth: 780, flex: 1 }}>
              <Typography
                variant="h1"
                sx={{
                  maxWidth: 390,
                  color: "#123B68",
                  paddingBottom: 1.1,
                }}
              >
                SafeBridge
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pb: 0.35 }}>
                <Chip label="INITIA WORKSTATION" color="primary" size="small" />
                <Chip label="VALIDATE FIRST" variant="outlined" size="small" />
              </Stack>

              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ maxWidth: 760 }}
              >
                Check the route before you submit it.
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 660 }}
              >
                Live RPC checks, route rules, and execution proof stay on one screen.
              </Typography>
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
                }}
              >
                <Typography variant="overline" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    letterSpacing: "-0.02em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    fontFamily:
                      item.label === "Last tx hash" ? '"Roboto Mono", "SFMono-Regular", monospace' : undefined,
                    fontSize: item.label === "Last tx hash" ? "0.95rem" : undefined,
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
              px: 1.35,
              py: 1,
              maxWidth: 1220,
              ml: { md: 2 },
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ minWidth: 118 }}
            >
              Demo flow
            </Typography>
            <Stack
              direction="row"
              spacing={0.9}
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
              pt: 0.75,
              ml: { md: 1.5 },
            }}
          >
            {heroMetrics.map((metric) => (
              <Stack
                key={metric.label}
                spacing={0.55}
                sx={{ minWidth: 0, flex: 1, px: { sm: 1.5 }, py: 0.5 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {metric.label}
                  </Typography>
                </Stack>
                <Typography
                  variant="subtitle1"
                  sx={{ letterSpacing: "-0.02em" }}
                >
                  {metric.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
