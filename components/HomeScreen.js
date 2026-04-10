'use client';

import { useMemo, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import AppShell from './AppShell';
import BridgeFormCard from './BridgeFormCard';
import ExecutionStatusCard from './ExecutionStatusCard';
import ValidationPanel from './ValidationPanel';
import { defaultBridgeForm, initiaConfig } from '../lib/appConfig';
import { executeBridgeIntent } from '../lib/bridgeExecutor';
import { createWalletSession } from '../lib/initiaWallet';
import { validateBridgeIntent } from '../lib/validationEngine';

const defaultValidationState = {
  loading: false,
  result: null,
  hasRun: false,
  lastRunAt: null,
};

const defaultExecutionState = {
  status: 'idle',
  mode: 'idle',
  txHash: null,
  explorerUrl: null,
  category: null,
  message: null,
};

function createValidationFailureResult(message) {
  return {
    confidence: 'low',
    checks: [
      {
        key: 'rpc',
        label: 'RPC reachability',
        status: 'fail',
        message,
      },
    ],
    summary: 'Validation could not complete. Re-run the check after connectivity stabilizes.',
    metadata: {
      mode: 'hybrid',
      validatedAt: new Date().toISOString(),
    },
  };
}

export default function HomeScreen() {
  const {
    address,
    username,
    isConnected,
    openConnect,
    openWallet,
    requestTxBlock,
    disconnect,
  } = useInterwovenKit();

  const wallet = useMemo(
    () => createWalletSession({ address, username, isConnected }),
    [address, username, isConnected]
  );

  const [bridgeForm, setBridgeForm] = useState(defaultBridgeForm);
  const [validationState, setValidationState] = useState(defaultValidationState);
  const [executionState, setExecutionState] = useState(defaultExecutionState);

  const bridgeDisabled = useMemo(() => {
    if (!wallet || !validationState.hasRun || !validationState.result) {
      return true;
    }

    return validationState.result.confidence === 'low';
  }, [validationState, wallet]);

  const currentDemoStep = useMemo(() => {
    if (executionState.status === 'success' || executionState.status === 'failure') {
      return 5;
    }

    if (executionState.status === 'submitting' || executionState.status === 'submitted') {
      return 4;
    }

    if (validationState.result) {
      return 3;
    }

    if (validationState.loading) {
      return 2;
    }

    const hasConfiguredIntent =
      Boolean(bridgeForm.destinationRollup) &&
      Boolean(bridgeForm.asset) &&
      bridgeForm.amount !== '';

    return hasConfiguredIntent ? 2 : 1;
  }, [bridgeForm, executionState.status, validationState.loading, validationState.result]);

  const statusItems = useMemo(() => {
    const validationValue = validationState.loading
      ? 'Running'
      : validationState.result
        ? `${validationState.result.confidence.toUpperCase()}`
        : 'Idle';

    const executionValue =
      executionState.mode === 'idle'
        ? 'Awaiting execution'
        : executionState.mode === 'real_intent_anchor'
          ? 'Real handoff'
          : 'Fallback sim';

    const items = [
      {
        label: 'Wallet status',
        value: wallet ? wallet.statusLabel : 'Disconnected',
        caption: wallet ? wallet.displayAddress : 'Connect OKX Wallet',
      },
      {
        label: 'Network',
        value: initiaConfig.chainLabel,
        caption: initiaConfig.chainId,
      },
      {
        label: 'Validation state',
        value: validationValue,
        caption: validationState.lastRunAt
          ? `Checked at ${new Date(validationState.lastRunAt).toLocaleTimeString()}`
          : 'Hybrid route diagnostics',
      },
      {
        label: 'Execution mode',
        value: executionValue,
        caption:
          executionState.txHash
            ? `${executionState.txHash.slice(0, 8)}...${executionState.txHash.slice(-6)}`
            : executionState.mode === 'real_intent_anchor'
              ? 'Tx hash available after submission'
              : 'Real-first with explicit fallback',
      },
    ];

    if (executionState.txHash) {
      items.push({
        label: 'Last tx hash',
        value: `${executionState.txHash.slice(0, 12)}...${executionState.txHash.slice(-6)}`,
        caption: executionState.txHash,
      });
    }

    return items;
  }, [executionState, validationState, wallet]);

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;

    setBridgeForm((current) => ({
      ...current,
      [field]: value,
    }));

    setValidationState(defaultValidationState);
    setExecutionState(defaultExecutionState);
  };

  const handleRunValidation = async () => {
    setValidationState({
      loading: true,
      result: null,
      hasRun: true,
      lastRunAt: null,
    });
    setExecutionState(defaultExecutionState);

    try {
      const result = await validateBridgeIntent(bridgeForm);

      setValidationState({
        loading: false,
        result,
        hasRun: true,
        lastRunAt: result.metadata?.validatedAt || new Date().toISOString(),
      });
    } catch (error) {
      const result = createValidationFailureResult(
        error?.message || 'SafeBridge could not complete the validation run.'
      );

      setValidationState({
        loading: false,
        result,
        hasRun: true,
        lastRunAt: result.metadata.validatedAt,
      });
    }
  };

  const handleBridgeNow = async () => {
    if (bridgeDisabled || !validationState.result) {
      return;
    }

    setExecutionState({
      status: 'submitting',
      mode: 'idle',
      txHash: null,
      explorerUrl: null,
      category: null,
      message: 'Opening the execution flow.',
    });

    const result = await executeBridgeIntent({
      form: bridgeForm,
      validation: validationState.result,
      wallet,
      walletKit: {
        requestTxBlock,
      },
      onLifecycle: (status) => {
        setExecutionState((current) => ({
          ...current,
          status,
        }));
      },
    });

    setExecutionState({
      status: result.status,
      mode: result.mode,
      txHash: result.txHash || null,
      explorerUrl: result.explorerUrl || null,
      category: result.category || null,
      message: result.message || null,
    });
  };

  return (
    <AppShell
      wallet={wallet}
      isConnected={isConnected}
      onConnectWallet={openConnect}
      onOpenWallet={openWallet}
      onDisconnectWallet={disconnect}
      statusItems={statusItems}
      currentDemoStep={currentDemoStep}
    >
      <Grid container spacing={3.5} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 7 }}>
          <BridgeFormCard
            form={bridgeForm}
            wallet={wallet}
            validationState={validationState}
            executionLoading={executionState.status === 'submitting'}
            bridgeDisabled={bridgeDisabled}
            onFormChange={handleFormChange}
            onRunValidation={handleRunValidation}
            onBridgeNow={handleBridgeNow}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <ValidationPanel
              wallet={wallet}
              form={bridgeForm}
              validationState={validationState}
            />
            <ExecutionStatusCard
              wallet={wallet}
              form={bridgeForm}
              validationResult={validationState.result}
              executionState={executionState}
              chainLabel={initiaConfig.chainLabel}
              chainId={initiaConfig.chainId}
            />
          </Box>
        </Grid>
      </Grid>
    </AppShell>
  );
}
