import { useChainId, useChains } from "wagmi";

export function useNetworkInfo() {
  const chainId = useChainId();
  const chains = useChains();

  const currentChain = chains.find((chain) => chain.id === chainId);

  // Check if the chain is supported by our config
  const isChainSupported = chains.some((chain) => chain.id === chainId);

  // Get user-friendly chain name
  const getChainName = () => {
    if (!chainId) return "Not Connected";
    if (chainId === 1287) return "Moonbase Alpha (Testnet)";
    if (chainId === 1284) return "Moonbeam (Mainnet)";
    return currentChain?.name || `Unknown Network (${chainId})`;
  };

  return {
    chainId,
    chainName: getChainName(),
    isTestnet: currentChain?.testnet || false,
    isMoonbeam: chainId === 1284 || chainId === 1287, // Moonbeam (1284) or Moonbase Alpha (1287)
    isConnectedToCorrectChain: chainId === 1287, // Moonbase Alpha
    isChainSupported,
    availableChains: chains,
    currentChain,
    hasChainsConfigured: chains.length > 0,
  };
}
