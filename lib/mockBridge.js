import { executionConfig } from "./appConfig";

function createHash(seed) {
  const normalized = seed.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `0x${normalized.slice(0, 18).padEnd(18, 'a')}9f3b71`;
}

export async function simulateBridgeExecution({ form, validation, wallet }) {
  await new Promise((resolve) => setTimeout(resolve, 1400));

  if (!wallet) {
    return {
      status: 'error',
      category: executionConfig.missingWalletOutcome.category,
      message: executionConfig.missingWalletOutcome.message,
    };
  }

  if (validation.confidence === executionConfig.successConfidence) {
    return {
      status: 'success',
      txHash: createHash(`${wallet.address}${form.destinationRollup}${form.asset}${form.amount}`),
    };
  }

  const pairOutcome = executionConfig.pairOutcomes[`${form.destinationRollup}|${form.asset}`];
  if (pairOutcome) {
    return {
      status: 'error',
      category: pairOutcome.category,
      message: pairOutcome.message,
    };
  }

  if (Number(form.amount) >= executionConfig.amountThresholdOutcome.minAmount) {
    return {
      status: 'error',
      category: executionConfig.amountThresholdOutcome.category,
      message: executionConfig.amountThresholdOutcome.message,
    };
  }

  return {
    status: 'error',
    category: executionConfig.fallbackOutcome.category,
    message: executionConfig.fallbackOutcome.message,
  };
}
