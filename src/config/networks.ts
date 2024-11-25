import { Chain } from 'wagmi';

export const polygon: Chain = {
  id: 137,
  name: 'Polygon',
  network: 'polygon',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://polygon-rpc.com',
        'https://rpc-mainnet.matic.network',
        'https://matic-mainnet.chainstacklabs.com',
        'https://rpc-mainnet.maticvigil.com',
        'https://rpc-mainnet.matic.quiknode.pro',
        'https://polygon.llamarpc.com',
        'https://polygon.rpc.blxrbdn.com',
        'https://polygon.blockpi.network/v1/rpc/public',
      ],
    },
    public: {
      http: [
        'https://polygon-rpc.com',
        'https://rpc-mainnet.matic.network',
        'https://matic-mainnet.chainstacklabs.com',
        'https://rpc-mainnet.maticvigil.com',
        'https://rpc-mainnet.matic.quiknode.pro',
        'https://polygon.llamarpc.com',
        'https://polygon.rpc.blxrbdn.com',
        'https://polygon.blockpi.network/v1/rpc/public',
      ],
    },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://polygonscan.com' },
  },
};