import { shortenAddress } from './address';

export function createWalletSession({ address, username, isConnected }) {
  if (!isConnected || !address) {
    return null;
  }

  return {
    address,
    username: username || null,
    displayAddress: shortenAddress(address),
    displayName: username || shortenAddress(address),
    statusLabel: 'Connected',
  };
}
