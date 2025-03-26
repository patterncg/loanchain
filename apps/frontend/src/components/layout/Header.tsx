import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import type { Connector } from "wagmi";
import { NetworkSwitch } from "./NetworkSwitch";

export function Header() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect, isPending, error, isError } = useConnect();
  const { theme, toggleTheme } = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [connectingConnector, setConnectingConnector] = useState<string | null>(
    null,
  );
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showDirectConnect, setShowDirectConnect] = useState(false);

  // Reset connection error when dialog opens/closes
  useEffect(() => {
    setConnectionError(null);
    // After 5 seconds with no successful connection, show the direct connect option
    const timer = setTimeout(() => {
      if (isDialogOpen) {
        setShowDirectConnect(true);
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (!isDialogOpen) {
        setShowDirectConnect(false);
      }
    };
  }, [isDialogOpen]);

  // Close dialog when connection is successful
  useEffect(() => {
    if (isConnected && isDialogOpen) {
      // Add a small delay to let the user see the successful connection
      const timer = setTimeout(() => setIsDialogOpen(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isDialogOpen]);

  // Show error message when connection fails
  useEffect(() => {
    if (isError && error) {
      setConnectionError(
        error.message || "Connection failed. Please try again.",
      );
      console.error("Wallet connection error:", error);
      // Show direct connect option immediately if there's an error
      setShowDirectConnect(true);
    }
  }, [isError, error]);

  const handleConnect = (connector: Connector) => {
    try {
      setConnectingConnector(connector.name);
      setConnectionError(null);

      if (!connector.ready) {
        if (connector.name === "MetaMask") {
          setConnectionError(
            "MetaMask extension not detected or locked. Please install MetaMask or unlock your wallet.",
          );
          window.open("https://metamask.io/download/", "_blank");
          setShowDirectConnect(true);
          return;
        }
        setConnectionError(
          `${connector.name} is not ready. Please make sure it's installed and enabled.`,
        );
        return;
      }

      console.log(`Attempting to connect with ${connector.name}...`);

      // Explicitly try to connect to Moonbase Alpha testnet
      connect({
        connector,
        chainId: 1287, // Moonbase Alpha
      });
    } catch (err) {
      console.error("Error initiating wallet connection:", err);
      setConnectionError(
        `Connection error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setShowDirectConnect(true);
    }
  };

  // Direct connection to MetaMask bypassing wagmi
  const handleDirectConnect = async () => {
    try {
      setConnectionError(null);

      if (!window.ethereum) {
        setConnectionError("MetaMask not installed. Please install MetaMask.");
        window.open("https://metamask.io/download/", "_blank");
        return;
      }

      // Request accounts - this will prompt the MetaMask popup
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Now try to switch to Moonbase Alpha (chainId 1287)
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x507" }], // 1287 in hex
        });

        // Refresh the page after successful connection
        window.location.reload();
      } catch (err: unknown) {
        const switchError = err as { code?: number };
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

            // Refresh the page after successful chain addition
            window.location.reload();
          } catch (addError) {
            console.error("Error adding Moonbase Alpha to MetaMask:", addError);
            setConnectionError("Failed to add Moonbase Alpha network");
          }
        } else {
          console.error("Error switching to Moonbase Alpha:", switchError);
          setConnectionError("Failed to switch to Moonbase Alpha network");
        }
      }
    } catch (err) {
      console.error("Error connecting directly to MetaMask:", err);
      setConnectionError(
        err instanceof Error ? err.message : "Failed to connect to MetaMask",
      );
    }
  };

  // Format address for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="bg-card text-card-foreground shadow-sm py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">LoanChain</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <span className="h-5 w-5">☀️</span>
            ) : (
              <span className="h-5 w-5">🌙</span>
            )}
          </Button>

          {!isConnected ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">Connect Wallet</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Connect your wallet</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-4">
                  {/* Only show connectors that are ready */}
                  {connectors.some((c) => c.ready) ? (
                    connectors
                      .filter((c) => c.ready)
                      .map((connector) => (
                        <Button
                          key={connector.name}
                          onClick={() => handleConnect(connector)}
                          disabled={isPending}
                          className="w-full justify-start gap-2"
                        >
                          {isPending &&
                          connectingConnector === connector.name ? (
                            <span className="animate-pulse">Connecting...</span>
                          ) : (
                            <span className="truncate">{connector.name}</span>
                          )}
                        </Button>
                      ))
                  ) : (
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                        No compatible wallets detected
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        Please install MetaMask or try the direct connection
                        below
                      </p>
                    </div>
                  )}

                  {/* Direct connection option */}
                  {(showDirectConnect || !connectors.some((c) => c.ready)) && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm font-medium mb-2">
                        Try direct connection:
                      </p>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={handleDirectConnect}
                        disabled={isPending}
                      >
                        Connect MetaMask Directly
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        This bypasses the standard connection flow
                      </p>
                    </div>
                  )}

                  {(connectionError || error?.message) && (
                    <div className="mt-3 p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                      {connectionError ||
                        error?.message ||
                        "Failed to connect. Please try again."}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>
                      This app requires connection to the Moonbase Alpha
                      testnet.
                    </p>
                    <p className="mt-1">
                      If you don't have MetaMask installed,{" "}
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        download it here
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex items-center gap-3">
              <NetworkSwitch />

              <Button
                variant="outline"
                size="sm"
                className="font-mono"
                onClick={() => disconnect()}
              >
                {formatAddress(address)}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
