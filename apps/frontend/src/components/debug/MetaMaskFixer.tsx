import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccount, useConnect } from "wagmi";

interface EthereumProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  [key: string]: unknown;
}

interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

interface MetaMaskFixerProps {
  onConnect?: () => void;
}

export function MetaMaskFixer({ onConnect }: MetaMaskFixerProps) {
  const [status, setStatus] = useState({
    hasProvider: false,
    isConnected: false,
    chainId: null as number | null,
    accounts: [] as string[],
    isCorrectNetwork: false,
    isMetaMask: false,
    error: null as string | null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [syncingWithWagmi, setSyncingWithWagmi] = useState(false);

  // Get wagmi state
  const { isConnected: wagmiConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Detect provider on mount
  useEffect(() => {
    detectProvider();
  }, []);

  // Sync MetaMask state with wagmi if needed
  useEffect(() => {
    // If MetaMask shows connected but wagmi doesn't, try to sync them
    if (
      status.isConnected &&
      status.isCorrectNetwork &&
      !wagmiConnected &&
      !syncingWithWagmi
    ) {
      syncWithWagmi();
    }
  }, [
    status.isConnected,
    status.isCorrectNetwork,
    wagmiConnected,
    syncingWithWagmi,
  ]);

  // Try to sync an existing MetaMask connection with wagmi
  const syncWithWagmi = async () => {
    try {
      setSyncingWithWagmi(true);
      console.log("Syncing existing MetaMask connection with wagmi...");

      // Find MetaMask connector
      const metaMaskConnector = connectors.find(
        (c) =>
          c.name.toLowerCase().includes("metamask") ||
          c.id.toLowerCase().includes("metamask"),
      );

      if (metaMaskConnector && metaMaskConnector.ready) {
        await connect({ connector: metaMaskConnector });
        console.log("Connected to MetaMask via wagmi sync");

        if (onConnect) {
          onConnect();
        }
      } else {
        console.warn("MetaMask connector not found or not ready");
        // Try injected connector as fallback
        const injectedConnector = connectors.find((c) =>
          c.id.toLowerCase().includes("injected"),
        );
        if (injectedConnector && injectedConnector.ready) {
          await connect({ connector: injectedConnector });
          console.log("Connected to MetaMask via injected connector");

          if (onConnect) {
            onConnect();
          }
        }
      }
    } catch (err) {
      console.error("Error syncing with wagmi:", err);
      setStatus((prev) => ({
        ...prev,
        error: `Failed to sync with application: ${err instanceof Error ? err.message : "Unknown error"}`,
      }));
    } finally {
      setSyncingWithWagmi(false);
    }
  };

  const detectProvider = async () => {
    try {
      // Check if we have an Ethereum provider
      const hasProvider = typeof window !== "undefined" && !!window.ethereum;
      if (!hasProvider) {
        setStatus({
          ...status,
          hasProvider: false,
          error: "No Ethereum provider detected. Please install MetaMask.",
        });
        return;
      }

      // Type the ethereum provider
      const provider = window.ethereum as EthereumProvider;
      const isMetaMask = !!provider.isMetaMask;

      // Check if already connected by getting accounts
      const accounts = (await provider.request({
        method: "eth_accounts",
      })) as string[];
      const isConnected = accounts && accounts.length > 0;

      // Get the current chain ID if connected
      let chainId = null;
      let isCorrectNetwork = false;
      if (isConnected) {
        const hexChainId = (await provider.request({
          method: "eth_chainId",
        })) as string;
        chainId = parseInt(hexChainId, 16);
        isCorrectNetwork = chainId === 1287; // Moonbase Alpha
      }

      setStatus({
        hasProvider,
        isConnected,
        chainId,
        accounts,
        isCorrectNetwork,
        isMetaMask,
        error: null,
      });
    } catch (err) {
      console.error("Error detecting provider:", err);
      setStatus({
        ...status,
        error:
          err instanceof Error
            ? err.message
            : "Unknown error detecting provider",
      });
    }
  };

  const connectMetaMask = async () => {
    try {
      setIsLoading(true);
      setStatus((prev) => ({ ...prev, error: null }));

      if (!window.ethereum) {
        setStatus((prev) => ({
          ...prev,
          error: "MetaMask not installed. Please install MetaMask.",
        }));
        return;
      }

      const provider = window.ethereum as EthereumProvider;

      // Request accounts
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      const isConnected = accounts && accounts.length > 0;

      // Update connection status
      setStatus((prev) => ({
        ...prev,
        isConnected,
        accounts,
      }));

      // If connected, get chain ID
      if (isConnected) {
        const hexChainId = (await provider.request({
          method: "eth_chainId",
        })) as string;
        const chainId = parseInt(hexChainId, 16);
        const isCorrectNetwork = chainId === 1287;

        setStatus((prev) => ({
          ...prev,
          chainId,
          isCorrectNetwork,
        }));

        // If not on correct network, switch to Moonbase Alpha
        if (!isCorrectNetwork) {
          await switchToMoonbase();
        } else {
          // Try to sync with wagmi
          await syncWithWagmi();
        }
      }
    } catch (err) {
      console.error("Error connecting to MetaMask:", err);
      setStatus((prev) => ({
        ...prev,
        error:
          err instanceof Error
            ? err.message
            : "Unknown error connecting to MetaMask",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const switchToMoonbase = async () => {
    try {
      setIsLoading(true);
      setStatus((prev) => ({ ...prev, error: null }));

      if (!window.ethereum) {
        setStatus((prev) => ({
          ...prev,
          error: "MetaMask not installed. Please install MetaMask.",
        }));
        return;
      }

      const provider = window.ethereum as EthereumProvider;

      try {
        // Try to switch to Moonbase Alpha
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x507" }], // 1287 in hex
        });

        // Get updated chain ID
        const hexChainId = (await provider.request({
          method: "eth_chainId",
        })) as string;
        const chainId = parseInt(hexChainId, 16);
        const isCorrectNetwork = chainId === 1287;

        setStatus((prev) => ({
          ...prev,
          chainId,
          isCorrectNetwork,
        }));

        if (isCorrectNetwork) {
          // Try to sync with wagmi
          await syncWithWagmi();
        }
      } catch (err) {
        const switchError = err as ProviderRpcError;

        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            // Add Moonbase Alpha to MetaMask
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

            // Check if switch was successful
            const hexChainId = (await provider.request({
              method: "eth_chainId",
            })) as string;
            const chainId = parseInt(hexChainId, 16);
            const isCorrectNetwork = chainId === 1287;

            setStatus((prev) => ({
              ...prev,
              chainId,
              isCorrectNetwork,
            }));

            if (isCorrectNetwork) {
              // Try to sync with wagmi
              await syncWithWagmi();
            }
          } catch (addError) {
            console.error("Error adding Moonbase Alpha:", addError);
            setStatus((prev) => ({
              ...prev,
              error: "Failed to add Moonbase Alpha network to MetaMask",
            }));
          }
        } else {
          console.error("Error switching to Moonbase Alpha:", err);
          setStatus((prev) => ({
            ...prev,
            error: "Failed to switch to Moonbase Alpha network",
          }));
        }
      }
    } catch (err) {
      console.error("Error in network switching process:", err);
      setStatus((prev) => ({
        ...prev,
        error:
          err instanceof Error
            ? err.message
            : "Unknown error during network switching",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>MetaMask Connection Helper</span>
          {status.isMetaMask && (
            <Badge variant="outline" className="ml-2 px-2 py-0">
              MetaMask Detected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status indicators */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">MetaMask Available:</div>
          <div>{status.hasProvider ? "✅ Yes" : "❌ No"}</div>

          <div className="font-medium">Connected to MetaMask:</div>
          <div>{status.isConnected ? "✅ Yes" : "❌ No"}</div>

          <div className="font-medium">Connected to App:</div>
          <div>{wagmiConnected ? "✅ Yes" : "❌ No"}</div>

          {status.isConnected && (
            <>
              <div className="font-medium">Wallet Address:</div>
              <div className="font-mono text-xs">
                {status.accounts.length > 0
                  ? formatAddress(status.accounts[0])
                  : "None"}
              </div>

              <div className="font-medium">Current Network:</div>
              <div className="flex items-center gap-1">
                {status.chainId ? (
                  <>
                    <span>Chain ID: {status.chainId}</span>
                    {status.isCorrectNetwork ? (
                      <Badge
                        variant="outline"
                        className="ml-1 px-1 py-0 text-[10px] bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      >
                        Moonbase Alpha
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="ml-1 px-1 py-0 text-[10px]"
                      >
                        Wrong Network
                      </Badge>
                    )}
                  </>
                ) : (
                  "Unknown"
                )}
              </div>
            </>
          )}
        </div>

        {/* Sync Status */}
        {status.isConnected && !wagmiConnected && (
          <div className="p-3 text-sm text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
            You're connected to MetaMask but not to the application. Click "Sync
            Connection" below.
          </div>
        )}

        {/* Error message */}
        {status.error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
            {status.error}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          {!status.isConnected ? (
            <Button
              onClick={connectMetaMask}
              disabled={!status.hasProvider || isLoading}
              className="w-full"
            >
              {isLoading ? "Connecting..." : "Connect MetaMask"}
            </Button>
          ) : !status.isCorrectNetwork ? (
            <Button
              onClick={switchToMoonbase}
              disabled={isLoading}
              className="w-full"
              variant="secondary"
            >
              {isLoading ? "Switching..." : "Switch to Moonbase Alpha"}
            </Button>
          ) : !wagmiConnected ? (
            <Button
              onClick={syncWithWagmi}
              disabled={syncingWithWagmi}
              className="w-full"
              variant="default"
            >
              {syncingWithWagmi ? "Syncing..." : "Sync Connection with App"}
            </Button>
          ) : (
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              variant="outline"
            >
              Refresh Application
            </Button>
          )}

          <div className="text-xs text-muted-foreground text-center mt-2">
            {!status.hasProvider ? (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Install MetaMask
              </a>
            ) : status.isConnected && wagmiConnected ? (
              "Connected successfully to MetaMask and application"
            ) : status.isConnected ? (
              "Connected to MetaMask but not yet synced with application"
            ) : (
              "Click the button above to connect to MetaMask"
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
