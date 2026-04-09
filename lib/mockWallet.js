import { walletOptions } from "./appConfig";
import { shortenAddress } from "./address";

const walletMetadata = walletOptions.reduce((accumulator, option) => {
  accumulator[option.id] = option;
  return accumulator;
}, {});

const MOCK_WALLETS = {
  'initia-wallet': {
    id: 'initia-wallet',
    address: 'init1safe9qx3p4m7d9v4k2w8ux3y2r3mct8az7z9d',
  },
};

export async function connectMockWallet(walletId) {
  const wallet = MOCK_WALLETS[walletId];

  await new Promise((resolve) => setTimeout(resolve, 550));

  return {
    ...walletMetadata[walletId],
    ...wallet,
    displayAddress: shortenAddress(wallet.address),
  };
}
