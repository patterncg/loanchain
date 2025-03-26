import { useAccount, useChainId, useConnections, useConnect } from "wagmi";
import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DetectWallet } from "./DetectWallet";

// Helper to safely stringify complex objects
const safeStringify = (obj: unknown) => {
  try {
    return JSON.stringify(
      obj,
      (key, value) => {
        // Avoid circular references
        if (key === "provider" || key === "transport") return "[Provider]";
        if (typeof value === "function") return "[Function]";
        if (typeof value === "bigint") return value.toString();
        return value;
      },
      2,
    );
  } catch {
    return "[Error Stringifying]";
  }
};

export function DebugInfo() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasSeenDebugInfo, setHasSeenDebugInfo] = useState(false);
  const { address, connector, status: accountStatus } = useAccount();
  const { connectors, isPending, status: connectStatus, error } = useConnect();
  const connections = useConnections();
  const chainId = useChainId();
  const { chainName, isConnectedToCorrectChain, isChainSupported } =
    useNetworkInfo();

  // See if window.ethereum is available
  const hasEthereum = typeof window !== "undefined" && window.ethereum;
  const isMetaMaskInstalled = hasEthereum && window.ethereum.isMetaMask;

  // Mark as seen when expanded
  useEffect(() => {
    if (isExpanded) {
      setHasSeenDebugInfo(true);
    }
  }, [isExpanded]);

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <div className="relative">
        <Button
          variant="secondary"
          size="default"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-2 font-semibold shadow-md"
        >
          {isExpanded ? "Hide Debug" : "Debug Info"}
        </Button>

        {!hasSeenDebugInfo && (
          <>
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
            <div className="absolute right-full mr-2 top-1 bg-white dark:bg-slate-800 text-black dark:text-white text-xs p-2 rounded shadow-lg whitespace-nowrap">
              Click for debugging tools! <span className="text-xs">👈</span>
            </div>
          </>
        )}
      </div>

      {isExpanded && (
        <div className="p-4 bg-card border rounded-lg shadow-lg w-80 text-sm overflow-auto max-h-[80vh]">
          <h3 className="font-medium mb-2">Wallet Connection Status</h3>
          <div className="space-y-1">
            <p>
              <span className="font-medium">Account Status:</span>{" "}
              {accountStatus}
            </p>
            <p>
              <span className="font-medium">Connect Status:</span>{" "}
              {connectStatus}
            </p>
            <p>
              <span className="font-medium">Pending:</span>{" "}
              {isPending ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">Has Ethereum:</span>{" "}
              {hasEthereum ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">MetaMask Installed:</span>{" "}
              {isMetaMaskInstalled ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">Connector:</span>{" "}
              {connector?.name || "None"}
            </p>
            <p>
              <span className="font-medium">Address:</span>{" "}
              {address
                ? `${address.substring(0, 8)}...${address.substring(address.length - 6)}`
                : "Not connected"}
            </p>
            <p>
              <span className="font-medium">Chain ID:</span>{" "}
              {chainId || "Unknown"}
            </p>
            <p>
              <span className="font-medium">Network:</span> {chainName}
            </p>
            <p>
              <span className="font-medium">Correct Chain:</span>{" "}
              {isConnectedToCorrectChain ? "✅ Yes" : "❌ No"}
            </p>
            <p>
              <span className="font-medium">Chain Supported:</span>{" "}
              {isChainSupported ? "✅ Yes" : "❌ No"}
            </p>

            {error && (
              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded">
                <p className="font-medium text-red-600 dark:text-red-400">
                  Error:
                </p>
                <p className="whitespace-pre-wrap break-words text-xs">
                  {error.message}
                </p>
              </div>
            )}

            <div className="mt-2">
              <p className="font-medium mb-1">Available Connectors:</p>
              <ul className="list-disc list-inside text-xs">
                {connectors.map((c) => (
                  <li
                    key={c.uid}
                    className={
                      c.ready
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {c.name} {c.ready ? "✅" : "❌"}
                  </li>
                ))}
              </ul>
            </div>

            {connections.length > 0 && (
              <div className="mt-2">
                <p className="font-medium mb-1">Active Connections:</p>
                <pre className="text-xs p-2 bg-muted/50 rounded overflow-auto max-h-32">
                  {safeStringify(
                    connections.map((c) => ({
                      connector: c.connector.name,
                      chainId: c.chainId,
                      accounts: c.accounts.map(
                        (a) => a.substring(0, 6) + "...",
                      ),
                    })),
                  )}
                </pre>
              </div>
            )}

            <DetectWallet />
          </div>
        </div>
      )}
    </div>
  );
}
