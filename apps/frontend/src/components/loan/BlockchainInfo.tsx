interface BlockchainInfoProps {
  tokenId: string;
  issuer?: string;
  timestamp?: number;
  txHash?: string;
  blockNumber?: number;
}

export function BlockchainInfo({ 
  tokenId, 
  issuer, 
  timestamp, 
  txHash,
  blockNumber
}: BlockchainInfoProps) {
  // Format address for display
  const formatAddress = (address?: string) => {
    if (!address) return "Unknown";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Format transaction hash for display
  const formatTxHash = (hash?: string) => {
    if (!hash) return "Unknown";
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <p className="text-sm font-medium">Token ID:</p>
        <p className="text-sm font-mono">{tokenId}</p>
        
        <p className="text-sm font-medium">Issuer:</p>
        <p className="text-sm font-mono">
          {issuer ? (
            <a 
              href={`https://moonbase.moonscan.io/address/${issuer}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary hover:underline"
            >
              {formatAddress(issuer)}
            </a>
          ) : (
            "Unknown"
          )}
        </p>
        
        <p className="text-sm font-medium">Creation Date:</p>
        <p className="text-sm">
          {timestamp ? new Date(timestamp).toLocaleString() : "Unknown"}
        </p>
        
        {txHash && (
          <>
            <p className="text-sm font-medium">Transaction Hash:</p>
            <p className="text-sm font-mono">
              <a 
                href={`https://moonbase.moonscan.io/tx/${txHash}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary hover:underline"
              >
                {formatTxHash(txHash)}
              </a>
            </p>
          </>
        )}
        
        {blockNumber && (
          <>
            <p className="text-sm font-medium">Block Number:</p>
            <p className="text-sm font-mono">
              <a 
                href={`https://moonbase.moonscan.io/block/${blockNumber}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary hover:underline"
              >
                {blockNumber.toLocaleString()}
              </a>
            </p>
          </>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          This loan token is stored on the Moonbase Alpha testnet, a test network for Moonbeam.
          All blockchain transactions are visible to the public.
        </p>
      </div>
    </div>
  );
} 