import { initiaConfig } from './appConfig';

function firstApiAddress(apiGroup) {
  if (!Array.isArray(apiGroup) || apiGroup.length === 0) {
    return '';
  }

  return apiGroup[0]?.address || '';
}

function normalizeRollup(chain) {
  const rpcUrl = firstApiAddress(chain.apis?.rpc);
  const restUrl = firstApiAddress(chain.apis?.rest);

  if (!rpcUrl || !restUrl) {
    return null;
  }

  const label = chain.pretty_name || chain.chain_name || chain.chain_id;
  const rollupType = chain.metadata?.minitia?.type || 'rollup';

  return {
    id: chain.chain_id,
    chainId: chain.chain_id,
    label,
    type: rollupType,
    logoUrl: chain.logo_URIs?.png || '',
    rpc: {
      url: rpcUrl,
      healthUrl: `${rpcUrl.replace(/\/$/, '')}/status`,
      label: `${label} RPC`,
    },
    rest: {
      url: restUrl,
      nodeInfoUrl: `${restUrl.replace(/\/$/, '')}/cosmos/base/tendermint/v1beta1/node_info`,
      bridgeInfoUrl: `${restUrl.replace(/\/$/, '')}/opinit/opchild/v1/bridge_info`,
    },
  };
}

export async function getLiveDestinationRollups() {
  const response = await fetch(`${initiaConfig.registryUrl.replace(/\/$/, '')}/chains.json`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Registry lookup failed with HTTP ${response.status}`);
  }

  const chains = await response.json();

  return chains
    .filter(
      (chain) =>
        !chain?.metadata?.is_l1 &&
        ['minievm', 'miniwasm', 'minimove'].includes(chain?.metadata?.minitia?.type)
    )
    .map(normalizeRollup)
    .filter(Boolean)
    .sort((left, right) => left.label.localeCompare(right.label));
}

export async function getDestinationRollupByLabel(label) {
  const rollups = await getLiveDestinationRollups();
  return rollups.find((rollup) => rollup.label === label) || null;
}
