import { initiaConfig } from './appConfig';

export function getExplorerTxUrl(txHash) {
  if (!txHash || !initiaConfig.explorerTxBaseUrl) {
    return null;
  }

  return `${initiaConfig.explorerTxBaseUrl.replace(/\/$/, '')}/${txHash}`;
}
