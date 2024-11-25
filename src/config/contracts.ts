// Contract addresses on Polygon Mainnet
export const LOVE_TOKEN_ADDRESS = '0x459f1c7D4574f27ED9341def22Bbb688D20CF8B9';

export const SUPPORTED_CHAINS = {
  POLYGON: 137,
} as const;

export const CONTRACT_ADDRESSES = {
  [SUPPORTED_CHAINS.POLYGON]: {
    LOVE_TOKEN: LOVE_TOKEN_ADDRESS,
  },
} as const;