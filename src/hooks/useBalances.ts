import { useBalance } from 'wagmi';
import { useTokenContract } from './useTokenContract';
import { useState, useEffect } from 'react';

export function useBalances() {
  const { balance: loveBalance } = useTokenContract();
  const [maticPrice, setMaticPrice] = useState<number>(0);
  const [lovePrice] = useState<number>(0.0001); // Fixed LOVE token price

  const { data: maticBalance } = useBalance({
    watch: true,
  });

  useEffect(() => {
    // Fetch MATIC price from CoinGecko API
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd')
      .then(res => res.json())
      .then(data => {
        setMaticPrice(data['matic-network'].usd);
      })
      .catch(console.error);
  }, []);

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const maticBalanceNum = parseFloat(maticBalance?.formatted || '0');
  const loveBalanceNum = parseFloat(loveBalance || '0');

  const maticUsdValue = maticBalanceNum * maticPrice;
  const loveUsdValue = loveBalanceNum * lovePrice;
  const totalUsdValue = maticUsdValue + loveUsdValue;

  return {
    matic: {
      balance: maticBalanceNum.toFixed(4),
      usdValue: formatUSD(maticUsdValue),
    },
    love: {
      balance: loveBalanceNum.toFixed(2),
      usdValue: formatUSD(loveUsdValue),
    },
    total: {
      usdValue: formatUSD(totalUsdValue),
    },
  };
}