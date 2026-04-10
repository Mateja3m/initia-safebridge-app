import { Alert, Box, Chip, Divider, Link, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import SectionHeader from './SectionHeader';

const guidanceByCategory = {
  network_issue: {
    why: 'The transaction path encountered unstable network conditions during submission.',
    next: 'Retry after endpoint stability returns, then re-run validation.',
  },
  route_issue: {
    why: 'Route support or capacity could not sustain the selected execution path.',
    next: 'Switch destination or asset pair, then score transfer readiness again.',
  },
  user_rejection: {
    why: 'The connected signer did not approve the execution flow.',
    next: 'Re-open the wallet flow and approve execution when the route is ready.',
  },
  timeout_instability: {
    why: 'The network did not confirm execution inside the expected time window.',
    next: 'Re-run validation and consider reducing size before retrying.',
  },
};

const categoryLabel = {
  network_issue: 'Network issue',
  route_issue: 'Route issue',
  user_rejection: 'User rejection',
  timeout_instability: 'Timeout / instability',
};

function getLifecycleState(executionState, validationResult, stepKey) {
  if (stepKey === 'intent') {
    return 'complete';
  }

  if (stepKey === 'validation') {
    if (validationResult) {
      return validationResult.confidence === 'low' ? 'failed' : 'complete';
    }

    return 'pending';
  }

  if (stepKey === 'submitted') {
    if (executionState.status === 'submitting' || executionState.status === 'submitted') {
      return 'active';
    }

    if (executionState.status === 'success' || executionState.status === 'failure') {
      return 'complete';
    }

    return 'pending';
  }

  if (stepKey === 'result') {
    if (executionState.status === 'failure') {
      return 'failed';
    }

    if (executionState.status === 'success') {
      return 'complete';
    }

    if (executionState.status === 'submitted') {
      return 'active';
    }

    return 'pending';
  }

  return 'pending';
}

const lifecycleDefinitions = [
  { id: '01', key: 'intent', label: 'Intent configured' },
  { id: '02', key: 'validation', label: 'Validation scored' },
  { id: '03', key: 'submitted', label: 'Bridge handoff opened' },
  { id: '04', key: 'result', label: 'Handoff state received' },
];

const lifecycleTone = {
  pending: { chip: 'default', dot: 'text.disabled' },
  active: { chip: 'primary', dot: 'primary.main' },
  complete: { chip: 'success', dot: 'success.main' },
  failed: { chip: 'error', dot: 'error.main' },
};

export default function ExecutionStatusCard({
  wallet,
  form,
  validationResult,
  executionState,
  chainLabel,
  chainId,
}) {
  const rpcCheck = validationResult?.checks?.find((check) => check.key === 'rpc');
  const lifecycle = lifecycleDefinitions.map((step) => ({
    ...step,
    state: getLifecycleState(executionState, validationResult, step.key),
  }));

  const proactiveGuidance =
    validationResult?.confidence === 'low' && rpcCheck?.status === 'fail'
      ? 'Validation is blocking execution because an RPC endpoint is unreachable. Retry later, switch destination, or verify route health.'
      : validationResult?.confidence === 'low'
        ? 'Validation is blocking execution. Reconfigure the route before submission.'
        : rpcCheck?.status === 'warn'
          ? 'RPC latency is elevated. The bridge handoff is still reviewable, but re-check route health if the transfer is not urgent.'
      : validationResult?.confidence === 'medium'
        ? 'Bridge handoff is possible, but re-check route status or amount if the transfer is not urgent.'
        : 'If the handoff fails, SafeBridge will classify the issue at the wallet or handoff stage and suggest the next step.';

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: { xs: 1.4, md: 2.1 },
        backgroundColor: 'background.paper',
        boxShadow: '0 10px 24px rgba(22, 48, 94, 0.06)',
      }}
    >
      <Stack spacing={{ xs: 1.2, md: 1.75 }}>
        <Stack spacing={{ xs: 0.55, md: 0.9 }} sx={{ pb: { xs: 0.7, md: 1 }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="overline" color="text.secondary">
            OUTPUT / EXECUTION
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.84rem', md: undefined }, lineHeight: 1.45 }}>
            Handoff state, route details, and recovery guidance.
          </Typography>
        </Stack>

        <SectionHeader
          eyebrow="Bridge Handoff"
          title="Handoff Terminal"
          description="SafeBridge records when a validated route is passed into the live Interwoven Bridge flow."
        />

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: '#F8FAFE',
            p: { xs: 0.95, md: 1.2 },
          }}
        >
          <Stack spacing={1}>
            <Typography variant="overline" color="primary.main">
              Handoff Lifecycle
            </Typography>
            {lifecycle.map((step) => (
              <Stack key={step.label} direction="row" spacing={0.75} alignItems="center">
                <Chip
                  label={step.id}
                  size="small"
                  color={lifecycleTone[step.state].chip}
                  variant={step.state === 'complete' ? 'filled' : 'outlined'}
                />
                <FiberManualRecordRoundedIcon
                  sx={{
                    fontSize: 10,
                    color: lifecycleTone[step.state].dot,
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.86rem', md: undefined } }} color={step.state === 'pending' ? 'text.secondary' : 'text.primary'}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  {step.state.toUpperCase()}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: '#F7FAFF',
            p: { xs: 0.95, md: 1.2 },
          }}
        >
          <Stack spacing={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
              <Typography variant="overline" color="primary.main">
                Bridge Path
              </Typography>
              <Chip size="small" label="Interwoven route" variant="outlined" />
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip label={form.sourceNetwork} />
              <Typography variant="body2" color="text.secondary">
                →
              </Typography>
              <Chip label={form.destinationRollup} color="primary" variant="outlined" />
              <Chip label={form.asset} color="secondary" variant="outlined" />
            </Stack>
          </Stack>
        </Box>

        {!wallet ? (
          <Alert severity="info" sx={{ borderRadius: 1.5, fontSize: { xs: '0.84rem', md: undefined } }}>
            Wallet connection is required before execution can open.
          </Alert>
        ) : null}

        {executionState.status === 'submitting' ? (
          <Alert severity="info" sx={{ borderRadius: 1.5, fontSize: { xs: '0.84rem', md: undefined } }}>
            Opening Interwoven Bridge with the validated route details.
          </Alert>
        ) : null}

        {executionState.status === 'submitted' ? (
          <Alert severity="info" sx={{ borderRadius: 1.5, fontSize: { xs: '0.84rem', md: undefined } }}>
            Interwoven Bridge opened. Continue the transfer in the bridge modal.
          </Alert>
        ) : null}

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'background.paper',
            p: { xs: 0.95, md: 1.2 },
          }}
        >
          <Stack spacing={1}>
            <Typography variant="overline" color="primary.main">
              Handoff Details
            </Typography>
            <Stack divider={<Divider flexItem />}>
              <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ py: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Tx hash
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: '"Roboto Mono", "SFMono-Regular", monospace', fontSize: { xs: '0.72rem', md: '0.8rem' }, textAlign: 'right', maxWidth: { xs: '58%', md: '70%' }, wordBreak: 'break-all' }}>
                  {executionState.txHash || 'Managed in bridge modal'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ py: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Network
                </Typography>
                <Typography variant="body2">{chainLabel}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ py: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Chain id
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: '"Roboto Mono", "SFMono-Regular", monospace', fontSize: { xs: '0.78rem', md: undefined } }}>{chainId}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ py: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Execution mode
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'right', maxWidth: { xs: '58%', md: '70%' } }}>
                  {executionState.mode === 'interwoven_bridge'
                    ? 'Interwoven Bridge handoff'
                    : 'Awaiting execution'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ py: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Explorer
                </Typography>
                {executionState.explorerUrl ? (
                  <Link href={executionState.explorerUrl} target="_blank" rel="noreferrer" underline="hover">
                    View transaction
                  </Link>
                ) : (
                  <Typography variant="body2">Not available</Typography>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Box>

        {executionState.status === 'idle' ? (
          <Box
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: { xs: 1, md: 1.25 },
              backgroundColor: '#F8FAFE',
            }}
          >
            <Typography variant="subtitle1">Execution idle</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.84rem', md: undefined } }}>
              {validationResult
                ? 'Bridge handoff can proceed once the current validation result is accepted.'
                : 'Bridge handoff unlocks after wallet connection and a completed validation run.'}
            </Typography>
          </Box>
        ) : null}

        {executionState.status === 'success' ? (
          <Box
            sx={{
              p: { xs: 1.1, md: 1.4 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'success.main',
              bgcolor: 'success.soft',
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <CheckCircleRoundedIcon color="success" />
                <Typography variant="h6">Bridge handoff opened</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.84rem', md: undefined } }}>
                {executionState.message}
              </Typography>
            </Stack>
          </Box>
        ) : null}

        {executionState.status === 'failure' ? (
          <Box
            sx={{
              p: { xs: 1.1, md: 1.4 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.main',
              bgcolor: 'error.soft',
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <ErrorRoundedIcon color="error" />
                <Typography variant="h6">Bridge handoff failed</Typography>
              </Stack>
              <Chip
                label={categoryLabel[executionState.category]}
                color="error"
                variant="outlined"
                sx={{ alignSelf: 'flex-start' }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.84rem', md: undefined } }}>
                {executionState.message}
              </Typography>
            </Stack>
          </Box>
        ) : null}

        <Box
          sx={{
            border: '1px solid',
            borderColor: validationResult?.confidence === 'low' ? 'error.main' : 'divider',
            borderRadius: 2,
            backgroundColor: 'background.paper',
            p: { xs: 0.95, md: 1.2 },
          }}
        >
          <Stack spacing={0.9}>
            <Typography variant="overline" color="primary.main">
              Recovery Guidance
            </Typography>
            {executionState.status === 'failure' ? (
              <>
                <Typography variant="subtitle2">
                  {categoryLabel[executionState.category]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {guidanceByCategory[executionState.category].why}
                </Typography>
                <Typography variant="body2">
                  {guidanceByCategory[executionState.category].next}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.84rem', md: undefined }, lineHeight: 1.5 }}>
                {proactiveGuidance}
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
