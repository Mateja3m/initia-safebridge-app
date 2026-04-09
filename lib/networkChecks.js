function now() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }

  return Date.now();
}

function normalizeEndpointConfig(endpoint) {
  if (typeof endpoint === 'string') {
    return {
      url: endpoint,
      healthUrl: endpoint,
      label: endpoint,
    };
  }

  return {
    url: endpoint?.url || '',
    healthUrl: endpoint?.healthUrl || endpoint?.url || '',
    fallbackUrl: endpoint?.fallbackUrl || '',
    label: endpoint?.label || endpoint?.url || 'endpoint',
  };
}

function classifyProbeResult(result, thresholds) {
  if (!result.reachable) {
    return {
      ok: false,
      latencyMs: null,
      status: 'fail',
      message: 'RPC unreachable',
    };
  }

  if (result.latencyMs === null || result.latencyMs >= thresholds.failLatencyMs) {
    return {
      ok: false,
      latencyMs: result.latencyMs,
      status: 'fail',
      message: 'Severe latency detected',
    };
  }

  if (!result.ok) {
    return {
      ok: true,
      latencyMs: result.latencyMs,
      status: 'warn',
      message: `Probe responded with HTTP ${result.statusCode}`,
    };
  }

  if (result.latencyMs >= thresholds.warnLatencyMs) {
    return {
      ok: true,
      latencyMs: result.latencyMs,
      status: 'warn',
      message: 'High latency detected',
    };
  }

  return {
    ok: true,
    latencyMs: result.latencyMs,
    status: 'pass',
    message: 'RPC reachable',
  };
}

async function runFetchProbe(url, { timeoutMs }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        accept: 'application/json, text/plain, */*',
      },
      signal: controller.signal,
    });

    return {
      ok: response.ok,
      reachable: true,
      responded: true,
      latencyMs: Math.round(now() - startedAt),
      statusCode: response.status,
      url,
    };
  } catch (error) {
    return {
      ok: false,
      reachable: false,
      responded: false,
      latencyMs: null,
      statusCode: null,
      url,
      error: error?.name === 'AbortError' ? 'Request timed out' : error?.message || 'Request failed',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function probeRpc(endpoint, options = {}) {
  const config = normalizeEndpointConfig(endpoint);
  const timeoutMs = options.timeoutMs || 3500;
  const thresholds = {
    warnLatencyMs: options.warnLatencyMs || 400,
    failLatencyMs: options.failLatencyMs || 1200,
  };

  const primaryResult = await runFetchProbe(config.healthUrl, { timeoutMs });

  let finalResult = primaryResult;

  if (!primaryResult.reachable && config.fallbackUrl && config.fallbackUrl !== config.healthUrl) {
    finalResult = await runFetchProbe(config.fallbackUrl, { timeoutMs });
  }

  const classified = classifyProbeResult(finalResult, thresholds);

  return {
    ...classified,
    reachable: finalResult.reachable,
    responded: finalResult.responded,
    statusCode: finalResult.statusCode,
    error: finalResult.error,
    url: finalResult.url,
    label: config.label,
  };
}

export async function probeEndpoints(
  { sourceRpc, destinationRpc },
  options = {}
) {
  const [source, destination] = await Promise.all([
    probeRpc(sourceRpc, options),
    probeRpc(destinationRpc, options),
  ]);

  return {
    source,
    destination,
  };
}
