import {
  executionConfig,
} from './appConfig';

function classifyExecutionError(error) {
  const message = error?.message || 'Execution failed.';
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('user rejected') || normalizedMessage.includes('rejected')) {
    return {
      category: 'user_rejection',
      message: 'Signer approval was rejected before the transaction could be submitted.',
    };
  }

  if (normalizedMessage.includes('insufficient balance') || normalizedMessage.includes('for fees')) {
    return {
      category: 'network_issue',
      message: 'The connected wallet does not have enough testnet INIT to cover bridge fees on initiation-2.',
    };
  }

  if (normalizedMessage.includes('timeout')) {
    return {
      category: 'timeout_instability',
      message: 'The network did not confirm the transaction inside the expected window.',
    };
  }

  if (normalizedMessage.includes('route')) {
    return {
      category: 'route_issue',
      message,
    };
  }

  return {
    category: 'network_issue',
    message,
  };
}

export async function executeBridgeIntent({
  validation,
  wallet,
  walletKit,
  onLifecycle,
}) {
  if (!wallet?.address) {
    return {
      status: 'failure',
      mode: 'interwoven_bridge',
      category: executionConfig.missingWalletOutcome.category,
      message: executionConfig.missingWalletOutcome.message,
    };
  }

  if (!validation?.metadata?.bridgeDefaults) {
    return {
      status: 'failure',
      mode: 'interwoven_bridge',
      category: 'route_issue',
      message: 'Validation did not return an executable bridge route.',
    };
  }

  if (typeof walletKit?.openBridge !== 'function') {
    return {
      status: 'failure',
      mode: 'interwoven_bridge',
      category: 'network_issue',
      message: 'Interwoven bridge handoff is not available in the current wallet session.',
    };
  }

  try {
    onLifecycle?.('submitting');
    walletKit.openBridge(validation.metadata.bridgeDefaults);
    onLifecycle?.('submitted');

    return {
      status: 'success',
      mode: 'interwoven_bridge',
      txHash: null,
      explorerUrl: null,
      message:
        'Interwoven Bridge opened with the validated route. Continue the transfer in the bridge modal and wallet prompt.',
    };
  } catch (error) {
    return {
      status: 'failure',
      mode: 'interwoven_bridge',
      ...classifyExecutionError(error),
    };
  }
}
