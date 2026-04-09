import {
  getDestinationRollupConfig,
  getRouteSupportConfig,
  getSourceNetworkConfig,
  validationConfig,
} from './appConfig';
import { probeEndpoints } from './networkChecks';

function createCheck(key, label, status, message, meta = {}) {
  return { key, label, status, message, meta };
}

function parseAmount(amount) {
  const parsed = Number(amount);

  if (!amount || Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function summarizeConfidence({ failCount, warnCount }) {
  if (failCount > 0) {
    return {
      confidence: 'low',
      summary: validationConfig.summaries.low,
    };
  }

  if (warnCount > 0) {
    return {
      confidence: 'medium',
      summary: validationConfig.summaries.medium,
    };
  }

  return {
    confidence: 'high',
    summary: validationConfig.summaries.high,
  };
}

function getAmountCheck(amount) {
  if (!amount || amount <= 0) {
    return createCheck(
      'amount',
      'Amount sanity',
      'fail',
      validationConfig.amount.invalidMessage
    );
  }

  if (amount >= validationConfig.amount.warnThreshold) {
    return createCheck(
      'amount',
      'Amount sanity',
      'warn',
      validationConfig.amount.warnMessage,
      { threshold: validationConfig.amount.warnThreshold }
    );
  }

  return createCheck(
    'amount',
    'Amount sanity',
    'pass',
    validationConfig.amount.passMessage
  );
}

function getRouteCheck(form) {
  const routeSupport = getRouteSupportConfig(form.destinationRollup, form.asset);

  if (!routeSupport.supported) {
    return createCheck(
      'route',
      'Route availability',
      'fail',
      routeSupport.message ||
        'The selected asset and destination are not supported by the current route configuration.'
    );
  }

  if (routeSupport.warn) {
    return createCheck(
      'route',
      'Route availability',
      'warn',
      routeSupport.message ||
        'The route is available, but SafeBridge observed a lower-capacity operating path.'
    );
  }

  return createCheck(
    'route',
    'Route availability',
    'pass',
    'Route support is confirmed for the selected asset and destination.'
  );
}

function getRpcCheck(sourceProbe, destinationProbe) {
  const probes = [sourceProbe, destinationProbe];
  const failProbe = probes.find((probe) => probe.status === 'fail');

  if (failProbe) {
    return createCheck(
      'rpc',
      'RPC reachability',
      'fail',
      failProbe === sourceProbe
        ? `Source RPC unreachable${sourceProbe.error ? `: ${sourceProbe.error}.` : '.'}`
        : `Destination RPC unreachable${destinationProbe.error ? `: ${destinationProbe.error}.` : '.'}`,
      {
        source: sourceProbe,
        destination: destinationProbe,
      }
    );
  }

  const warnProbe = probes.find((probe) => probe.status === 'warn');

  if (warnProbe) {
    return createCheck(
      'rpc',
      'RPC reachability',
      'warn',
      warnProbe === sourceProbe
        ? `Source latency is elevated at ${sourceProbe.latencyMs}ms.`
        : `Destination latency is elevated at ${destinationProbe.latencyMs}ms.`,
      {
        source: sourceProbe,
        destination: destinationProbe,
      }
    );
  }

  return createCheck(
    'rpc',
    'RPC reachability',
    'pass',
    `Source latency ${sourceProbe.latencyMs}ms, destination latency ${destinationProbe.latencyMs}ms.`,
    {
      source: sourceProbe,
      destination: destinationProbe,
    }
  );
}

function getDestinationCheck(form, amount) {
  const destinationRule =
    validationConfig.destinationThresholdSignals.find(
      (signal) =>
        signal.rollup === form.destinationRollup && amount && amount >= signal.minAmount
    ) ||
    validationConfig.destinationRules[form.destinationRollup];

  if (destinationRule?.status === 'fail') {
    return createCheck(
      'destination',
      'Destination readiness',
      'fail',
      destinationRule.message
    );
  }

  if (destinationRule?.status === 'warn') {
    return createCheck(
      'destination',
      'Destination readiness',
      'warn',
      destinationRule.message
    );
  }

  return createCheck(
    'destination',
    'Destination readiness',
    'pass',
    destinationRule?.message ||
      'Destination readiness looks healthy for the selected rollup.'
  );
}

export async function validateBridgeIntent(form) {
  const amount = parseAmount(form.amount);
  const sourceNetwork = getSourceNetworkConfig(form.sourceNetwork);
  const destinationRollup = getDestinationRollupConfig(form.destinationRollup);

  const { source: sourceProbe, destination: destinationProbe } = await probeEndpoints(
    {
      sourceRpc: sourceNetwork.rpc,
      destinationRpc: destinationRollup.rpc,
    },
    {
      timeoutMs: validationConfig.timeoutMs,
      warnLatencyMs: validationConfig.healthyLatencyMs,
      failLatencyMs: validationConfig.degradedLatencyMs,
    }
  );

  const checks = [
    getRpcCheck(sourceProbe, destinationProbe),
    getRouteCheck(form),
    getDestinationCheck(form, amount),
    getAmountCheck(amount),
  ];

  const failCount = checks.filter((check) => check.status === 'fail').length;
  const warnCount = checks.filter((check) => check.status === 'warn').length;
  const { confidence, summary } = summarizeConfidence({ failCount, warnCount });

  return {
    confidence,
    checks,
    summary,
    metadata: {
      mode: 'hybrid',
      validatedAt: new Date().toISOString(),
      sourceProbe,
      destinationProbe,
    },
  };
}
