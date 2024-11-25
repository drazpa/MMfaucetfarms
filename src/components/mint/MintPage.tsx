import React from 'react';
import { Coins } from 'lucide-react';
import { useTokenContract } from '../../hooks/useTokenContract';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from 'wagmi';
import { polygon } from '../../config/networks';

export default function MintPage() {
  const { balance } = useTokenContract();
  const { chain } = useNetwork();
  const isPolygon = chain?.id === polygon.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="w-8 h-8 text-pink-600" />
            <h1 className="text-2xl font-bold gradient-text">LOVE Token Management</h1>
          </div>
          <p className="text-gray-600">
            Mint and manage your LOVE tokens on Polygon Network.
          </p>
        </div>

        {/* Balance Card */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Your LOVE Balance</h2>
              <p className="text-sm text-gray-500">Available on Polygon Network</p>
            </div>
            <div className="text-2xl font-bold gradient-text">
              {balance} LOVE
            </div>
          </div>
        </div>

        {/* ThirdWeb Embed */}
        <div className="card">
          <iframe
            src="https://embed.ipfscdn.io/ipfs/bafybeigdie2yyiazou7grjowoevmuip6akk33nqb55vrpezqdwfssrxyfy/erc20.html?contract=0x459f1c7D4574f27ED9341def22Bbb688D20CF8B9&chain=%7B%22name%22%3A%22Polygon+Mainnet%22%2C%22chain%22%3A%22Polygon%22%2C%22rpc%22%3A%5B%22https%3A%2F%2F137.rpc.thirdweb.com%2F%24%7BTHIRDWEB_API_KEY%7D%22%5D%2C%22nativeCurrency%22%3A%7B%22name%22%3A%22POL%22%2C%22symbol%22%3A%22POL%22%2C%22decimals%22%3A18%7D%2C%22shortName%22%3A%22matic%22%2C%22chainId%22%3A137%2C%22testnet%22%3Afalse%2C%22slug%22%3A%22polygon%22%2C%22icon%22%3A%7B%22url%22%3A%22ipfs%3A%2F%2FQmRNqgazYuxUa5WdddFPftTWiP3KwzBMgV9Z19QWnLMETc%22%2C%22width%22%3A2000%2C%22height%22%3A2000%2C%22format%22%3A%22png%22%7D%7D&clientId=b046a262aed43c52349454953d64c149&theme=system&primaryColor=red"
            width="100%"
            height="750px"
            style={{ maxWidth: '100%', border: 'none', borderRadius: '0.5rem' }}
            title="LOVE Token Management"
          />
        </div>
      </div>
    </div>
  );
}