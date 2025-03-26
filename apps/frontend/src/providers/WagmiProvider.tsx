import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider as WagmiConfig, createConfig, http } from "wagmi";
import { moonbaseAlpha } from "wagmi/chains";
import { ReactNode, useEffect } from "react";
import {
  injected,
  metaMask,
  walletConnect,
  coinbaseWallet,
} from "wagmi/connectors";

// Check if we're in the browser
const isBrowser = typeof window !== "undefined";

// Log initial wallet detection
if (isBrowser) {
  console.log("Window ethereum object:", {
    exists: !!window.ethereum,
    isMetaMask: window.ethereum?.isMetaMask,
    isCoinbaseWallet: window.ethereum?.isCoinbaseWallet,
    isBraveWallet: window.ethereum?.isBraveWallet,
    providers: window.ethereum?.providers,
  });
}

// Use a valid demo project ID for WalletConnect
// For production, create a project ID at https://cloud.walletconnect.com
const projectId = "c9cc1c6a40c9ce4f6bfe43b0fe9b2065"; // Demo project ID that works for testing

// Configure Moonbeam testnet with additional options
const moonbeamTestnet = {
  ...moonbaseAlpha,
  name: "Moonbase Alpha",
  rpcUrls: {
    ...moonbaseAlpha.rpcUrls,
    default: {
      http: ["https://rpc.api.moonbase.moonbeam.network"],
    },
    public: {
      http: ["https://rpc.api.moonbase.moonbeam.network"],
    },
  },
};

// Add explorer URL and other details
const enhancedMoonbaseAlpha = {
  ...moonbeamTestnet,
  blockExplorers: {
    default: {
      name: "Moonscan",
      url: "https://moonbase.moonscan.io",
    },
  },
  testnet: true,
};

// Create more permissive connectors with better debugging
const metaMaskConnector = metaMask();

const injectedConnector = injected();

// Create wagmi config with all required connectors
const config = createConfig({
  chains: [enhancedMoonbaseAlpha],
  transports: {
    [enhancedMoonbaseAlpha.id]: http(
      enhancedMoonbaseAlpha.rpcUrls.default.http[0],
    ),
  },
  connectors: [
    metaMaskConnector,
    injectedConnector,
    coinbaseWallet({
      appName: "LoanChain",
    }),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "LoanChain",
        description: "A decentralized lending platform on Moonbeam",
        url: isBrowser
          ? window.location.origin
          : "https://loanchain.example.com",
        icons: isBrowser
          ? [`${window.location.origin}/favicon.ico`]
          : ["https://loanchain.example.com/favicon.ico"],
      },
    }),
  ],
});

const queryClient = new QueryClient();

export function WagmiProvider({ children }: { children: ReactNode }) {
  // Log connector status on mount
  useEffect(() => {
    if (isBrowser) {
      console.log("Detected window.ethereum:", !!window.ethereum);
      if (window.ethereum) {
        console.log("MetaMask detected:", !!window.ethereum.isMetaMask);
        console.log("Available methods:", Object.keys(window.ethereum));
      }
    }
  }, []);

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  );
}
