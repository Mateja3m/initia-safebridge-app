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
  skipApiBaseUrl: process.env.NEXT_PUBLIC_SKIP_API_BASE_URL || 'https://api.skip.build',
};

export const sourceNetworkCatalog = [
  {
    id: 'initia-l1',
    label: 'Initia L1',
    chainId: initiaConfig.chainId,
    rpc: {
      url: 'https://rpc.testnet.initia.xyz',
      healthUrl: 'https://rpc.testnet.initia.xyz/status',
      label: 'Initia L1 RPC',
    },
    rest: {
      url: 'https://rest.testnet.initia.xyz',
      nodeInfoUrl: 'https://rest.testnet.initia.xyz/cosmos/base/tendermint/v1beta1/node_info',
      txUrlBase: 'https://rest.testnet.initia.xyz/cosmos/tx/v1beta1/txs',
    },
  },
];

export const assetCatalog = [
  {
    id: 'INIT',
    label: 'INIT',
    denom: 'uinit',
    decimals: 6,
  },
  {
    id: 'USDC',
    label: 'USDC',
    denom:
      'ibc/6490A7EAB61059BFC1CDDEB05917DD70BDF3A611654162A1A47DB930D40D8AF4',
    decimals: 6,
  },
  {
    id: 'ETH',
    label: 'ETH',
    denom:
      'move/edfcddacac79ab86737a1e9e65805066d8be286a37cb94f4884b892b0e39f954',
    decimals: 18,
  },
];

export const bridgeCatalog = {
  sourceNetworks: sourceNetworkCatalog,
  assets: assetCatalog,
};

export const bridgeOptions = {
  sourceNetworks: bridgeCatalog.sourceNetworks.map((network) => network.label),
  destinationRollups: [],
  assets: assetCatalog.map((asset) => asset.label),
};

export const defaultBridgeForm = {
  sourceNetwork: bridgeOptions.sourceNetworks[0],
  destinationRollup: '',
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
  summaries: {
    high:
      'Operational confidence is high. Live route discovery and endpoint health support execution.',
    medium:
      'A real route is available, but latency or destination health is degraded. Re-run validation if conditions change.',
    low:
      'Transaction feasibility is not sufficient for execution. Retry later, switch destination, or verify route health before submitting.',
  },
};

export const executionConfig = {
  explorerLabel: 'View on explorer',
  missingWalletOutcome: {
    category: 'user_rejection',
    message: 'No connected signer was available for execution.',
  },
};

export function getSourceNetworkConfig(label) {
  return sourceNetworkCatalog.find((network) => network.label === label);
}

export function getAssetConfig(label) {
  return assetCatalog.find((asset) => asset.label === label);
}
