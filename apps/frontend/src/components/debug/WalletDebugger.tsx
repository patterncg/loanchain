import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useConnect, useChainId, useDisconnect } from "wagmi";

// Define type for Ethereum provider
interface EthereumProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isBraveWallet?: boolean;
  providers?: EthereumProvider[];
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  [key: string]: unknown;
}

// Define type for error with code
interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

// We're not redefining the global Window interface to avoid conflicts
// Instead, we'll use type assertions within the component

export function WalletDebugger() {
  const [walletInfo, setWalletInfo] = useState({
    hasProvider: false,
    isMetaMask: false,
    isCoinbase: false,
    providerInfo: {} as Record<string, unknown>,
    error: null as string | null,
  });
  
  const { isConnected, address } = useAccount();
  const { connect, connectors, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  // Load wallet information on mount
  useEffect(() => {
    detectWallet();
  }, []);

  const detectWallet = () => {
    try {
      const hasProvider = typeof window !== "undefined" && !!window.ethereum;
      
      if (hasProvider && window.ethereum) {
        // Use ethereum provider as typed interface
        const provider = window.ethereum as EthereumProvider;
        
        const providerInfo = {
          isMetaMask: provider.isMetaMask,
          isCoinbaseWallet: provider.isCoinbaseWallet,
          isBraveWallet: provider.isBraveWallet,
          hasProviders: !!provider.providers,
          providerCount: provider.providers?.length || 0,
          availableMethods: Object.keys(provider).filter(
            key => typeof provider[key] === 'function'
          ),
        };
        
        setWalletInfo({
          hasProvider,
          isMetaMask: !!provider.isMetaMask,
          isCoinbase: !!provider.isCoinbaseWallet,
          providerInfo,
          error: null,
        });
      } else {
        setWalletInfo({
          hasProvider: false,
          isMetaMask: false,
          isCoinbase: false,
          providerInfo: {},
          error: "No Ethereum provider found in window.ethereum",
        });
      }
    } catch (err) {
      setWalletInfo({
        hasProvider: false,
        isMetaMask: false,
        isCoinbase: false,
        providerInfo: {},
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleDirectConnect = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not installed. Please install MetaMask.");
        return;
      }

      // Use ethereum provider as typed interface
      const provider = window.ethereum as EthereumProvider;

      // Request accounts - this will prompt the MetaMask popup
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      console.log("Connected accounts:", accounts);

      // Try to switch to Moonbase Alpha
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x507" }], // 1287 in hex
        });
      } catch (err) {
        const switchError = err as ProviderRpcError;
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x507", // 1287 in hex
                  chainName: "Moonbase Alpha",
                  nativeCurrency: {
                    name: "DEV",
                    symbol: "DEV",
                    decimals: 18,
                  },
                  rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
                  blockExplorerUrls: ["https://moonbase.moonscan.io"],
                },
              ],
            });
          } catch (addError) {
            console.error("Error adding Moonbase Alpha:", addError);
          }
        } else {
          console.error("Error switching chain:", err);
        }
      }

      // Refresh the wallet info after connecting
      detectWallet();
    } catch (err) {
      console.error("Direct connect error:", err);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto my-6">
      <CardHeader>
        <CardTitle className="text-xl">Wallet Connection Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Detection */}
        <div className="space-y-3">
          <h3 className="font-medium text-lg">Wallet Detection</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Provider Available:</div>
            <div>{walletInfo.hasProvider ? "✅ Yes" : "❌ No"}</div>
            
            <div className="font-medium">MetaMask Detected:</div>
            <div>{walletInfo.isMetaMask ? "✅ Yes" : "❌ No"}</div>
            
            <div className="font-medium">Coinbase Wallet Detected:</div>
            <div>{walletInfo.isCoinbase ? "✅ Yes" : "❌ No"}</div>
            
            {walletInfo.error && (
              <>
                <div className="font-medium text-red-500">Error:</div>
                <div className="text-red-500">{walletInfo.error}</div>
              </>
            )}
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="space-y-3">
          <h3 className="font-medium text-lg">Connection Status</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Connected:</div>
            <div>{isConnected ? "✅ Yes" : "❌ No"}</div>
            
            {isConnected && (
              <>
                <div className="font-medium">Address:</div>
                <div className="font-mono">{address}</div>
                
                <div className="font-medium">Chain ID:</div>
                <div>
                  {chainId} 
                  {chainId === 1287 ? " (✅ Moonbase Alpha)" : " (❌ Wrong Network)"}
                </div>
              </>
            )}
            
            {connectError && (
              <>
                <div className="font-medium text-red-500">Connection Error:</div>
                <div className="text-red-500">{connectError.message}</div>
              </>
            )}
          </div>
        </div>
        
        {/* Connection Buttons */}
        <div className="space-y-3">
          <h3 className="font-medium text-lg">Connection Actions</h3>
          <div className="space-y-2">
            <div className="space-x-2">
              {!isConnected ? (
                <>
                  {/* Wagmi Connectors */}
                  <div className="space-y-2">
                    <div className="font-medium">Via Wagmi:</div>
                    <div className="flex flex-wrap gap-2">
                      {connectors.map((connector) => (
                        <Button
                          key={connector.uid}
                          onClick={() => connect({ connector })}
                          disabled={!connector.ready || isPending}
                          variant="outline"
                          size="sm"
                        >
                          {connector.name}
                          {!connector.ready ? " (Not Ready)" : ""}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Direct Connect Button */}
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="font-medium">Direct Connect (Bypassing Wagmi):</div>
                    <Button 
                      onClick={handleDirectConnect} 
                      disabled={!walletInfo.hasProvider}
                      variant="secondary"
                      size="sm"
                    >
                      Connect Directly to MetaMask
                    </Button>
                  </div>
                </>
              ) : (
                <Button onClick={() => disconnect()} variant="outline" size="sm">
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Provider Details */}
        <div className="space-y-3">
          <h3 className="font-medium text-lg">Provider Details</h3>
          <div className="overflow-auto max-h-40 text-xs p-3 bg-muted rounded">
            <pre>{JSON.stringify(walletInfo.providerInfo, null, 2)}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 