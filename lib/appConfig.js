export const initiaConfig = {
  chainId: 'initiation-2',
  chainLabel: 'Initia Testnet',
  registryUrl:
    process.env.NEXT_PUBLIC_INITIA_REGISTRY_URL || 'https://registry.testnet.initia.xyz',
  routerApiUrl:
    process.env.NEXT_PUBLIC_INITIA_ROUTER_URL ||
    'https://router-api.initiation-2.initia.xyz',
  glyphUrl:
    process.env.NEXT_PUBLIC_INITIA_GLYPH_URL || 'https://glyph.initiation-2.initia.xyz',
  explorerTxBaseUrl: process.env.NEXT_PUBLIC_INITIA_EXPLORER_TX_BASE_URL || '',
};

export const bridgeCatalog = {
  sourceNetworks: [
    {
      id: 'initia-l1',
      label: 'Initia L1',
      rpc: {
        url: 'https://rpc.testnet.initia.xyz',
        healthUrl: 'https://rpc.testnet.initia.xyz/status',
        label: 'Initia L1 RPC',
      },
      endpointLabel: 'testnet rpc',
    },
  ],
  destinationRollups: [
    {
      id: 'miniswap',
      label: 'MiniSwap Rollup',
      rpc: {
        url: initiaConfig.routerApiUrl,
        healthUrl: initiaConfig.routerApiUrl,
        label: 'MiniSwap router edge',
      },
      endpointUrl: initiaConfig.routerApiUrl,
      endpointLabel: 'router edge',
      readiness: 'steady',
      executionMode: 'intent_anchor',
    },
    {
      id: 'yieldnet',
      label: 'YieldNet Rollup',
      rpc: {
        url: initiaConfig.registryUrl,
        healthUrl: initiaConfig.registryUrl,
        label: 'YieldNet registry edge',
      },
      endpointUrl: initiaConfig.registryUrl,
      endpointLabel: 'registry edge',
      readiness: 'watch',
      executionMode: 'intent_anchor',
    },
    {
      id: 'arenax',
      label: 'ArenaX Rollup',
      rpc: {
        url: initiaConfig.glyphUrl,
        healthUrl: initiaConfig.glyphUrl,
        label: 'ArenaX glyph edge',
      },
      endpointUrl: initiaConfig.glyphUrl,
      endpointLabel: 'glyph edge',
      readiness: 'constrained',
      executionMode: 'simulation_fallback',
    },
  ],
  assets: [
    {
      id: 'INIT',
      label: 'INIT',
      denom: 'uinit',
      decimals: 6,
      executionReady: true,
    },
    {
      id: 'USDC',
      label: 'USDC',
      denom:
        'ibc/6490A7EAB61059BFC1CDDEB05917DD70BDF3A611654162A1A47DB930D40D8AF4',
      decimals: 6,
      executionReady: false,
    },
    {
      id: 'ETH',
      label: 'ETH',
      denom:
        'move/edfcddacac79ab86737a1e9e65805066d8be286a37cb94f4884b892b0e39f954',
      decimals: 18,
      executionReady: false,
    },
  ],
};

export const bridgeOptions = {
  sourceNetworks: bridgeCatalog.sourceNetworks.map((network) => network.label),
  destinationRollups: bridgeCatalog.destinationRollups.map((rollup) => rollup.label),
  assets: bridgeCatalog.assets.map((asset) => asset.label),
};

export const defaultBridgeForm = {
  sourceNetwork: bridgeOptions.sourceNetworks[0],
  destinationRollup: bridgeOptions.destinationRollups[0],
  asset: bridgeOptions.assets[0],
  amount: '',
};

export const heroMetrics = [
  {
    label: 'Validation signals',
    value: '4 checks',
    hint: 'RPC, route, destination, amount',
  },
  {
    label: 'Execution posture',
    value: 'Validate first',
    hint: 'Confidence before execution',
  },
  {
    label: 'Interop mode',
    value: 'Interwoven',
    hint: 'Initia-native wallet handoff',
  },
];

export const validationConfig = {
  timeoutMs: 3500,
  healthyLatencyMs: 400,
  degradedLatencyMs: 1200,
  amount: {
    invalidMessage:
      'Enter a bridge amount greater than zero before SafeBridge can score transaction feasibility.',
    warnThreshold: 25000,
    warnMessage:
      'Large transfers can reduce transfer readiness. Consider splitting size before execution.',
    passMessage: 'Amount is within the normal operating range for this route.',
  },
  routeSupport: {
    'MiniSwap Rollup|INIT': { supported: true },
    'MiniSwap Rollup|USDC': { supported: true },
    'MiniSwap Rollup|ETH': { supported: true },
    'YieldNet Rollup|INIT': { supported: true },
    'YieldNet Rollup|USDC': { supported: true },
    'YieldNet Rollup|ETH': {
      supported: false,
      message:
        'Route availability is not confirmed for ETH into YieldNet on the current testnet setup.',
    },
    'ArenaX Rollup|INIT': { supported: true },
    'ArenaX Rollup|USDC': {
      supported: true,
      warn: true,
      message:
        'ArenaX is routing USDC through a reduced-capacity path. Transfer readiness is downgraded.',
    },
    'ArenaX Rollup|ETH': { supported: true },
  },
  destinationRules: {
    'MiniSwap Rollup': {
      status: 'pass',
      message:
        'Destination readiness is healthy. The selected rollup is accepting inbound bridge intents.',
    },
    'YieldNet Rollup': {
      status: 'warn',
      message:
        'Destination readiness is acceptable but finalization windows appear extended on YieldNet.',
    },
    'ArenaX Rollup': {
      status: 'warn',
      message:
        'ArenaX is online, but destination buffers are tighter than normal and should be watched.',
    },
  },
  destinationThresholdSignals: [
    {
      rollup: 'ArenaX Rollup',
      minAmount: 40000,
      status: 'fail',
      message:
        'Transfer size exceeds the currently observed destination buffer posture for ArenaX.',
    },
  ],
  summaries: {
    high:
      'Operational confidence is high. RPC reachability, route availability, and destination readiness support execution.',
    medium:
      'SafeBridge sees a viable route, but transfer readiness is degraded. Re-run validation if you change size, destination, or observe elevated latency.',
    low:
      'Transaction feasibility is not sufficient for execution. Retry later, switch destination, or verify route health before submitting.',
  },
};

export const executionConfig = {
  anchorAmount: '1',
  anchorDenom: 'uinit',
  memoPrefix: 'SafeBridge intent anchor',
  explorerLabel: 'View on explorer',
  pairOutcomes: {
    'YieldNet Rollup|INIT': {
      category: 'timeout_instability',
      message:
        'Execution fallback timed out while waiting for a clean destination confirmation window.',
    },
    'ArenaX Rollup|USDC': {
      category: 'route_issue',
      message:
        'Fallback execution could not reserve enough route capacity for ArenaX USDC transfer.',
    },
  },
  amountThresholdOutcome: {
    minAmount: 20000,
    category: 'network_issue',
    message:
      'Fallback execution detected unstable broadcast conditions during submission.',
  },
  missingWalletOutcome: {
    category: 'user_rejection',
    message: 'No connected signer was available for execution.',
  },
  fallbackOutcome: {
    category: 'user_rejection',
    message:
      'Execution was not confirmed. Re-open the wallet flow and submit again when ready.',
  },
};

export function getSourceNetworkConfig(label) {
  return bridgeCatalog.sourceNetworks.find((network) => network.label === label);
}

export function getDestinationRollupConfig(label) {
  return bridgeCatalog.destinationRollups.find((rollup) => rollup.label === label);
}

export function getAssetConfig(label) {
  return bridgeCatalog.assets.find((asset) => asset.label === label);
}

export function getRouteSupportConfig(destinationRollup, asset) {
  return validationConfig.routeSupport[`${destinationRollup}|${asset}`] || { supported: true };
}
