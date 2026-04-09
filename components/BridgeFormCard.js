import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { bridgeOptions } from '../lib/appConfig';
import SectionHeader from './SectionHeader';

export default function BridgeFormCard({
  form,
  wallet,
  validationState,
  executionLoading,
  bridgeDisabled,
  onFormChange,
  onRunValidation,
  onBridgeNow,
}) {
  const amountLabel = form.amount || '0.00';
  const submissionGateLabel = !wallet
    ? 'Wallet required'
    : validationState.loading
      ? 'Validation running'
      : validationState.hasRun
        ? 'Ready for review'
        : 'Awaiting validation';

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: { xs: 2, md: 2.4 },
        backgroundColor: 'background.paper',
        boxShadow: '0 18px 34px rgba(22, 48, 94, 0.08)',
      }}
    >
      <Stack spacing={2.25}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ pb: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Stack spacing={0.45}>
            <Typography variant="overline" color="text.secondary">
              WORKSPACE / BRIDGE DECISION
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Decide if this route should be executed.
            </Typography>
          </Stack>
        </Stack>

        <SectionHeader
          eyebrow="Bridge Intent"
          title="Transfer Workstation"
          description="Set the route, asset, and size. Then run validation."
        />

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 1.25,
            backgroundColor: '#F7FAFF',
          }}
        >
          <Stack spacing={1}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={1}
            >
              <Typography variant="overline" color="primary.main">
                Bridge Path
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip label={form.sourceNetwork} />
              <Typography variant="body2" color="text.secondary">
                →
              </Typography>
              <Chip label={form.destinationRollup} color="primary" variant="outlined" />
              <Chip label={form.asset} color="secondary" variant="outlined" />
            </Stack>
          </Stack>
        </Box>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="stretch">
          <Box
            sx={{
              flex: 1.05,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1.5,
              backgroundColor: '#F8FAFE',
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="overline" color="text.secondary">
                INTENT INPUT
              </Typography>

              {!wallet ? (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 1.5,
                    backgroundColor: 'rgba(90, 140, 255, 0.08)',
                    border: '1px solid rgba(90, 140, 255, 0.18)',
                  }}
                >
                  Connect wallet to unlock submit. Validation works before that.
                </Alert>
              ) : null}

              <Stack spacing={1.6}>
                <TextField
                  select
                  label="Source network"
                  value={form.sourceNetwork}
                  onChange={onFormChange('sourceNetwork')}
                  fullWidth
                >
                  {bridgeOptions.sourceNetworks.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Destination rollup"
                  value={form.destinationRollup}
                  onChange={onFormChange('destinationRollup')}
                  fullWidth
                >
                  {bridgeOptions.destinationRollups.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.6}>
                  <TextField
                    select
                    label="Asset"
                    value={form.asset}
                    onChange={onFormChange('asset')}
                    fullWidth
                  >
                    {bridgeOptions.assets.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Amount"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={onFormChange('amount')}
                    fullWidth
                    inputProps={{ inputMode: 'decimal' }}
                    helperText="Amount sanity contributes to the final confidence score."
                    FormHelperTextProps={{
                      sx: { maxWidth: 180 },
                    }}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 0.95,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1.5,
              backgroundColor: '#EEF3FD',
            }}
          >
            <Stack spacing={1.4}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.2}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Typography variant="overline" color="primary.main">
                  ROUTE STATUS
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip label={form.sourceNetwork} />
                <Chip label={form.destinationRollup} color="primary" variant="outlined" />
                <Chip label={form.asset} color="secondary" variant="outlined" />
              </Stack>

              <Typography variant="h4" sx={{ letterSpacing: '-0.04em', pt: 0.15 }}>
                {amountLabel} {form.asset}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This exact path is what gets checked.
              </Typography>

              <Box
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  pt: 1.25,
                  mt: 0.25,
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Estimated fee
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mt: 0.35 }}>
                      0.002 INIT
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Submission gate
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mt: 0.35 }}>
                      {submissionGateLabel}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Stack>

        <Box>
          <Stack spacing={1.3}>
            <Typography variant="subtitle1">Execution Posture</Typography>
            <Typography variant="body2" color="text.secondary">
              Validation decides if submit should open.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Submission gate
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.35 }}>
                  Submit stays locked until wallet + valid result.
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Execution mode
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.35 }}>
                  Real handoff first. Fallback only if needed.
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Interwoven route
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.35 }}>
                  Path stays visible through the whole flow.
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Divider flexItem />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            onClick={onRunValidation}
            disabled={validationState.loading || executionLoading}
            sx={{ flex: 1, minHeight: 54, backgroundColor: '#DCE6FA' }}
          >
            {validationState.loading ? 'Running Validation...' : 'Run Validation'}
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={onBridgeNow}
            disabled={bridgeDisabled || executionLoading || validationState.loading}
            sx={{ flex: 1.5, minHeight: 54 }}
          >
            {executionLoading ? 'Executing via Interwoven...' : 'Execute via Interwoven Bridge'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
