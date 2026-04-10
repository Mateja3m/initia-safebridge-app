import { getAssetConfig, getSourceNetworkConfig, validationConfig, initiaConfig } from './appConfig';
import { getRoutableDestinationRollups } from './liveCatalog';
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

function toBaseUnits(amount, decimals) {
  const [whole = '0', fraction = ''] = String(amount).split('.');
  const sanitizedWhole = whole.replace(/[^\d]/g, '') || '0';
  const sanitizedFraction = fraction.replace(/[^\d]/g, '').slice(0, decimals);
  const paddedFraction = sanitizedFraction.padEnd(decimals, '0');
  const normalized = `${sanitizedWhole}${paddedFraction}`.replace(/^0+(?=\d)/, '');
  return normalized || '0';
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
    return createCheck('amount', 'Amount sanity', 'fail', validationConfig.amount.invalidMessage);
  }

  if (amount >= validationConfig.amount.warnThreshold) {
    return createCheck('amount', 'Amount sanity', 'warn', validationConfig.amount.warnMessage, {
      threshold: validationConfig.amount.warnThreshold,
    });
  }

  return createCheck('amount', 'Amount sanity', 'pass', validationConfig.amount.passMessage);
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

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {}

  return {
    ok: response.ok,
    status: response.status,
    data: payload,
  };
}

async function getBridgeRoute(form, destination, asset) {
  const assetsResponse = await fetchJson(
    `${initiaConfig.skipApiBaseUrl.replace(/\/$/, '')}/v2/fungible/assets_from_source`,
    {
      method: 'POST',
      body: JSON.stringify({
        source_asset_denom: asset.denom,
        source_asset_chain_id: initiaConfig.chainId,
        allow_multi_tx: true,
      }),
    }
  );

  if (!assetsResponse.ok) {
    return {
      check: createCheck(
        'route',
        'Route availability',
        'fail',
        `Skip route discovery failed with HTTP ${assetsResponse.status}.`
      ),
      bridgeDefaults: null,
    };
  }

  const destinationAssets = assetsResponse.data?.dest_assets?.[destination.chainId]?.assets || [];
  const assetPair = destinationAssets[0];

  if (!assetPair?.denom) {
    return {
      check: createCheck(
        'route',
        'Route availability',
        'fail',
        `${asset.label} does not currently expose a real bridge route from ${form.sourceNetwork} into ${destination.label}.`
      ),
      bridgeDefaults: null,
    };
  }

  const amountIn = toBaseUnits(form.amount, asset.decimals);

  if (amountIn === '0') {
    return {
      check: createCheck(
        'route',
        'Route availability',
        'pass',
        'Route can be discovered once the transfer amount is valid.'
      ),
      bridgeDefaults: {
        srcChainId: initiaConfig.chainId,
        srcDenom: asset.denom,
        dstChainId: destination.chainId,
        dstDenom: assetPair.denom,
        quantity: String(form.amount || ''),
      },
    };
  }

  const routeResponse = await fetchJson(
    `${initiaConfig.skipApiBaseUrl.replace(/\/$/, '')}/v2/fungible/route`,
    {
      method: 'POST',
      body: JSON.stringify({
        source_asset_chain_id: initiaConfig.chainId,
        source_asset_denom: asset.denom,
        dest_asset_chain_id: destination.chainId,
        dest_asset_denom: assetPair.denom,
        amount_in: amountIn,
        cumulative_affiliate_fee_bps: '0',
        allow_multi_tx: true,
      }),
    }
  );

  if (!routeResponse.ok) {
    const routeError =
      routeResponse.data?.message ||
      routeResponse.data?.error ||
      `Skip route lookup failed with HTTP ${routeResponse.status}.`;

    return {
      check: createCheck('route', 'Route availability', 'fail', routeError),
      bridgeDefaults: null,
    };
  }

  const requiresMultiStep = Array.isArray(routeResponse.data?.operations)
    ? routeResponse.data.operations.length > 1
    : false;

  return {
    check: createCheck(
      'route',
      'Route availability',
      requiresMultiStep ? 'warn' : 'pass',
      requiresMultiStep
        ? 'A real route is available, but the bridge path expands into multiple bridge operations.'
        : 'A real Interwoven bridge route is available for the selected transfer.'
    ),
      bridgeDefaults: {
        srcChainId: initiaConfig.chainId,
        srcDenom: asset.denom,
        dstChainId: destination.chainId,
        dstDenom: assetPair.denom,
        quantity: String(form.amount || ''),
      },
    routeMeta: routeResponse.data,
  };
}

async function getDestinationReadiness(destination) {
  const [nodeInfoResponse, bridgeInfoResponse] = await Promise.all([
    fetchJson(destination.rest.nodeInfoUrl, { method: 'GET' }),
    fetchJson(destination.rest.bridgeInfoUrl, { method: 'GET' }),
  ]);

  if (!nodeInfoResponse.ok) {
    return createCheck(
      'destination',
      'Destination readiness',
      'fail',
      `Destination node info is unavailable on ${destination.label}.`
    );
  }

  if (!bridgeInfoResponse.ok) {
    return createCheck(
      'destination',
      'Destination readiness',
      'warn',
      `Destination node is responding, but bridge metadata is unavailable on ${destination.label}.`
    );
  }

  return createCheck(
    'destination',
    'Destination readiness',
    'pass',
    `${destination.label} is responding and reporting bridge metadata.`
  );
}

export async function validateBridgeIntentLive(form) {
  const amount = parseAmount(form.amount);
  const sourceNetwork = getSourceNetworkConfig(form.sourceNetwork);
  const asset = getAssetConfig(form.asset);
  const destinations = await getRoutableDestinationRollups(form.asset);
  const destination = destinations.find((rollup) => rollup.label === form.destinationRollup) || null;

  if (!sourceNetwork) {
    throw new Error(`Unknown source network: ${form.sourceNetwork}`);
  }

  if (!asset) {
    throw new Error(`Unknown asset: ${form.asset}`);
  }

  if (!destination) {
    throw new Error(`Unknown destination rollup: ${form.destinationRollup}`);
  }

  const { source: sourceProbe, destination: destinationProbe } = await probeEndpoints(
    {
      sourceRpc: sourceNetwork.rpc,
      destinationRpc: destination.rpc,
    },
    {
      timeoutMs: validationConfig.timeoutMs,
      warnLatencyMs: validationConfig.healthyLatencyMs,
      failLatencyMs: validationConfig.degradedLatencyMs,
    }
  );

  const rpcCheck = getRpcCheck(sourceProbe, destinationProbe);
  const [routeResult, destinationCheck, amountCheck] = await Promise.all([
    getBridgeRoute(form, destination, asset),
    getDestinationReadiness(destination),
    Promise.resolve(getAmountCheck(amount)),
  ]);

  const checks = [rpcCheck, routeResult.check, destinationCheck, amountCheck];
  const failCount = checks.filter((check) => check.status === 'fail').length;
  const warnCount = checks.filter((check) => check.status === 'warn').length;
  const { confidence, summary } = summarizeConfidence({ failCount, warnCount });

  return {
    confidence,
    checks,
    summary,
    metadata: {
      mode: 'live',
      validatedAt: new Date().toISOString(),
      sourceProbe,
      destinationProbe,
      destination,
      route: routeResult.routeMeta || null,
      bridgeDefaults: routeResult.bridgeDefaults || null,
    },
  };
}
