import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SwitchError extends Error {
  code?: number;
}

export function DetectWallet() {
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkProvider = async () => {
      try {
        setError(null);
        const hasEthereum = typeof window !== "undefined" && window.ethereum;
        setHasProvider(Boolean(hasEthereum));

        if (hasEthereum) {
          setIsInstalled(Boolean(window.ethereum.isMetaMask));

          // Try to get accounts to see if already connected
          try {
            const accounts = (await window.ethereum.request({
              method: "eth_accounts",
            })) as string[];
            setAccounts(accounts || []);
          } catch (err) {
            console.error("Error checking existing accounts:", err);
          }
        }
      } catch (err) {
        console.error("Error detecting wallet:", err);
        setError("Error detecting wallet");
      }
    };

    checkProvider();
  }, []);

  const handleConnect = async () => {
    try {
      setError(null);

      if (!window.ethereum) {
        setError("MetaMask not installed. Please install MetaMask.");
        return;
      }

      // Request accounts - this will prompt the MetaMask popup
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      setAccounts(accounts || []);

      // Now try to switch to Moonbase Alpha (chainId 1287)
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x507" }], // 1287 in hex
        });
      } catch (err) {
        const switchError = err as SwitchError;
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
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
            console.error("Error adding Moonbase Alpha to MetaMask:", addError);
            setError("Failed to add Moonbase Alpha network");
          }
        } else {
          console.error("Error switching to Moonbase Alpha:", switchError);
          setError("Failed to switch to Moonbase Alpha network");
        }
      }
    } catch (err) {
      console.error("Error connecting to MetaMask:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect to MetaMask",
      );
    }
  };

  return (
    <div className="mt-4 p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
      <h3 className="font-medium mb-2">Direct MetaMask Detection</h3>

      <div className="space-y-2 text-sm">
        <p>
          Provider Available:{" "}
          {hasProvider === null
            ? "Checking..."
            : hasProvider
              ? "✅ Yes"
              : "❌ No"}
        </p>
        <p>MetaMask Installed: {isInstalled ? "✅ Yes" : "❌ No"}</p>
        <p>
          Connected Accounts:{" "}
          {accounts.length
            ? accounts.map((acc) => acc.substring(0, 8) + "...").join(", ")
            : "None"}
        </p>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            Error: {error}
          </div>
        )}

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasProvider}
            onClick={handleConnect}
          >
            Connect Directly
          </Button>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            This button bypasses wagmi and connects directly to MetaMask for
            debugging purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
