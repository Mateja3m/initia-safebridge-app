import {
  executionConfig,
  getAssetConfig,
  getDestinationRollupConfig,
  initiaConfig,
} from './appConfig';
import { getExplorerTxUrl } from './explorer';
import { simulateBridgeExecution } from './mockBridge';

function createAnchorMessage(address, form) {
  return [
    {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: {
        fromAddress: address,
        toAddress: address,
        amount: [
          {
            amount: executionConfig.anchorAmount,
            denom: executionConfig.anchorDenom,
          },
        ],
      },
    },
  ];
}

function classifyExecutionError(error) {
  const message = error?.message || 'Execution failed.';
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('user rejected') || normalizedMessage.includes('rejected')) {
    return {
      category: 'user_rejection',
      message: 'Signer approval was rejected before the transaction could be submitted.',
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

async function runFallbackExecution({ form, validation, wallet }) {
  const fallbackResult = await simulateBridgeExecution({ form, validation, wallet });

  if (fallbackResult.status === 'success') {
    return {
      status: 'success',
      mode: 'fallback_simulation',
      txHash: fallbackResult.txHash,
      explorerUrl: getExplorerTxUrl(fallbackResult.txHash),
      message: 'Fallback simulation completed with a successful terminal state.',
    };
  }

  return {
    status: 'failure',
    mode: 'fallback_simulation',
    category: fallbackResult.category,
    message: fallbackResult.message,
  };
}

export async function executeBridgeIntent({
  form,
  validation,
  wallet,
  walletKit,
  onLifecycle,
}) {
  if (!wallet?.address) {
    return {
      status: 'failure',
      mode: 'fallback_simulation',
      category: executionConfig.missingWalletOutcome.category,
      message: executionConfig.missingWalletOutcome.message,
    };
  }

  const asset = getAssetConfig(form.asset);
  const destination = getDestinationRollupConfig(form.destinationRollup);
  const canSubmitIntentAnchor =
    destination?.executionMode === 'intent_anchor' &&
    asset?.denom &&
    typeof walletKit?.requestTxBlock === 'function';

  if (canSubmitIntentAnchor) {
    try {
      onLifecycle?.('submitting');

      const memo = `${executionConfig.memoPrefix}: ${form.asset} -> ${form.destinationRollup} (${form.amount || '0'})`;
      const { transactionHash } = await walletKit.requestTxBlock({
        chainId: initiaConfig.chainId,
        memo,
        messages: createAnchorMessage(wallet.address, form),
      });

      onLifecycle?.('submitted');

      return {
        status: 'success',
        mode: 'real_intent_anchor',
        txHash: transactionHash,
        explorerUrl: getExplorerTxUrl(transactionHash),
        message:
          'SafeBridge submitted a real Initia testnet intent anchor before bridge execution handoff.',
      };
    } catch (error) {
      const classifiedError = classifyExecutionError(error);

      if (
        classifiedError.category === 'user_rejection' ||
        classifiedError.category === 'timeout_instability'
      ) {
        return {
          status: 'failure',
          mode: 'real_intent_anchor',
          ...classifiedError,
        };
      }

      return runFallbackExecution({ form, validation, wallet });
    }
  }

  return runFallbackExecution({ form, validation, wallet });
}
