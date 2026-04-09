import { Box, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import SectionHeader from './SectionHeader';

const confidenceConfig = {
  high: {
    title: 'High confidence',
    icon: <ShieldRoundedIcon />,
    tone: 'success',
    blurb: 'Transaction feasibility is strong enough to proceed.',
  },
  medium: {
    title: 'Medium confidence',
    icon: <WarningAmberRoundedIcon />,
    tone: 'warning',
    blurb: 'Transfer readiness is usable, but the route should be watched carefully.',
  },
  low: {
    title: 'Low confidence',
    icon: <ErrorOutlineRoundedIcon />,
    tone: 'error',
    blurb: 'Execution should pause until blocking signals are resolved.',
  },
};

const statusTone = {
  idle: { label: 'IDLE', color: 'default' },
  checking: { label: 'CHECKING', color: 'info' },
  pass: { label: 'PASS', color: 'success' },
  warn: { label: 'WARN', color: 'warning' },
  fail: { label: 'FAIL', color: 'error' },
};

const validationLabels = {
  rpc: 'RPC reachability',
  route: 'Route availability',
  destination: 'Destination readiness',
  amount: 'Amount sanity',
};

const idleDetails = {
  rpc: 'Waiting to probe source and destination RPC',
  route: 'Waiting to confirm supported route',
  destination: 'Waiting to read destination readiness',
  amount: 'Waiting for route amount review',
};

const checkingDetails = {
  rpc: 'Checking source and destination RPC',
  route: 'Checking route support map',
  destination: 'Checking destination endpoint',
  amount: 'Checking amount posture',
};

function getCheckDetail(check) {
  if (!check) {
    return '';
  }

  if (check.key === 'rpc') {
    const sourceLatency = check.meta?.source?.latencyMs;
    const destinationLatency = check.meta?.destination?.latencyMs;

    if (check.meta?.source?.status === 'fail') {
      return 'Source RPC unreachable';
    }

    if (check.meta?.destination?.status === 'fail') {
      return 'Destination RPC unreachable';
    }

    if (
      sourceLatency !== null &&
      sourceLatency !== undefined &&
      destinationLatency !== null &&
      destinationLatency !== undefined
    ) {
      return `Source latency: ${sourceLatency}ms • Destination latency: ${destinationLatency}ms`;
    }
  }

  if (check.key === 'route' && check.status === 'pass') {
    return 'Route supported';
  }

  if (check.key === 'destination' && check.status === 'pass') {
    return 'Destination responding';
  }

  if (check.key === 'amount' && check.status === 'warn') {
    return 'Amount exceeds preferred threshold';
  }

  if (check.key === 'amount' && check.status === 'pass') {
    return 'Amount within preferred threshold';
  }

  return check.message;
}

function buildActivityRows(validationState, result) {
  const resultChecks = Object.fromEntries((result?.checks || []).map((check) => [check.key, check]));

  return ['rpc', 'route', 'destination', 'amount'].map((key) => {
    if (validationState.loading) {
      return {
        key,
        label: validationLabels[key],
        status: 'checking',
        detail: checkingDetails[key],
      };
    }

    if (resultChecks[key]) {
      return {
        key,
        label: validationLabels[key],
        status: resultChecks[key].status,
        detail: getCheckDetail(resultChecks[key]),
      };
    }

    return {
      key,
      label: validationLabels[key],
      status: 'idle',
      detail: idleDetails[key],
    };
  });
}

export default function ValidationPanel({ wallet, form, validationState }) {
  const result = validationState.result;
  const config = result ? confidenceConfig[result.confidence] : null;
  const passCount = result
    ? result.checks.filter((check) => check.status === 'pass').length
    : 0;
  const warnCount = result
    ? result.checks.filter((check) => check.status === 'warn').length
    : 0;
  const failCount = result
    ? result.checks.filter((check) => check.status === 'fail').length
    : 0;
  const activityRows = buildActivityRows(validationState, result);

  return (
    <Box
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: { xs: 2, md: 2.1 },
        backgroundColor: '#EAF0FB',
        boxShadow: '0 10px 24px rgba(22, 48, 94, 0.06)',
      }}
    >
      <Stack spacing={1.75}>
        <Stack spacing={0.9} sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="overline" color="text.secondary">
            MONITOR / VALIDATION ENGINE
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hybrid validation combines live endpoint checks with deterministic route scoring.
          </Typography>
        </Stack>

        <SectionHeader
          eyebrow="Validation Signals"
          title="Operational Confidence"
          description="Source reachability, route availability, destination readiness, and amount posture feed the final decision."
        />

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'background.paper',
            p: 1.2,
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="overline" color="primary.main">
                Validation Activity
              </Typography>
              {validationState.loading ? (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <CircularProgress size={14} />
                  <Typography variant="caption" color="text.secondary">
                    Running checks
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  {validationState.lastRunAt
                    ? `Last checked ${new Date(validationState.lastRunAt).toLocaleTimeString()}`
                    : 'No validation run yet'}
                </Typography>
              )}
            </Stack>

            <Stack divider={<Divider flexItem />}>
              {activityRows.map((row) => (
                <Stack
                  key={row.key}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1.25}
                  sx={{ py: 0.9 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2">{row.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.detail}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    {row.status === 'checking' ? (
                      <AutorenewRoundedIcon
                        sx={{ fontSize: 16, color: 'primary.main', animation: 'spin 1.2s linear infinite' }}
                      />
                    ) : null}
                    <Chip
                      size="small"
                      label={statusTone[row.status].label}
                      color={statusTone[row.status].color}
                      variant={row.status === 'pass' ? 'filled' : 'outlined'}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>

        {validationState.loading ? (
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              minHeight: 136,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'background.paper',
            }}
          >
            <Stack spacing={1.25} alignItems="center">
              <CircularProgress />
              <Typography variant="subtitle1">Interpreting validation output</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                SafeBridge is combining live endpoint feedback with route policy rules.
              </Typography>
            </Stack>
          </Box>
        ) : result ? (
          <Stack spacing={1.5}>
            <Box
              sx={{
                p: 1.4,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: `${config.tone}.soft`,
                    color: `${config.tone}.main`,
                    flexShrink: 0,
                  }}
                >
                  {config.icon}
                </Box>
                <Stack spacing={0.65} sx={{ flex: 1 }}>
                  <Typography variant="overline" color={`${config.tone}.main`}>
                    Confidence before execution
                  </Typography>
                  <Typography variant="h6">{config.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {config.blurb}
                  </Typography>
                  <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={`${passCount} PASS`} color="success" />
                    <Chip size="small" label={`${warnCount} WARN`} color="warning" variant="outlined" />
                    <Chip size="small" label={`${failCount} FAIL`} color="error" variant="outlined" />
                  </Stack>
                </Stack>
              </Stack>
            </Box>

            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.paper',
                p: 1.15,
              }}
            >
              <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={0}>
                <Box sx={{ flex: 1, px: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    ROUTE
                  </Typography>
                  <Typography variant="body2">{form.sourceNetwork}</Typography>
                </Box>
                <Box sx={{ flex: 1, px: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    DESTINATION
                  </Typography>
                  <Typography variant="body2">{form.destinationRollup}</Typography>
                </Box>
                <Box sx={{ flex: 1, px: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    SIZE
                  </Typography>
                  <Typography variant="body2">
                    {form.amount || '0.00'} {form.asset}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                borderRadius: 2,
                p: 1.25,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Typography variant="overline" sx={{ mb: 0.35, color: 'text.secondary', display: 'block' }}>
                Confidence summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {result.summary}
              </Typography>
              {validationState.lastRunAt ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  Last checked: {new Date(validationState.lastRunAt).toLocaleTimeString()}
                </Typography>
              ) : null}
            </Box>
          </Stack>
        ) : (
          <Box
            sx={{
              minHeight: 150,
              display: 'grid',
              alignContent: 'center',
              gap: 1.2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'background.paper',
              p: 1.5,
            }}
          >
            <Typography variant="h6">Validation idle</Typography>
            <Typography variant="body2" color="text.secondary">
              Run validation to score transaction feasibility for {form.asset || 'the selected asset'} into{' '}
              {form.destinationRollup || 'the chosen rollup'}.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {wallet
                ? 'Wallet session is active. A healthy result can move directly into execution.'
                : 'Validation remains available before connection so the route can be reviewed first.'}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
