import { WagmiProvider } from "./providers/WagmiProvider";
import { Layout } from "./components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { useAccount } from "wagmi";
import { useNetworkInfo } from "./hooks/useNetworkInfo";
import { NetworkSwitch } from "./components/layout/NetworkSwitch";
import { LoanCreationWizard } from "./components/loan/LoanCreationWizard";
import { MetaMaskFixer } from "./components/debug/MetaMaskFixer";
import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { LoanFeed } from "./components/feed/LoanFeed";
import { TokenDetailView } from "./components/loan/TokenDetailView";
import { TransactionHistoryPage } from "./pages/TransactionHistoryPage";
import { DemoPage } from "./pages/DemoPage";

// Home page content with navigation options
function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">LoanChain</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A decentralized lending platform on Moonbeam
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create a Loan</CardTitle>
            <CardDescription>Mint a new loan token with your terms</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create a new loan by defining its terms, amount, and other parameters.
              Our AI will enhance your loan with risk assessment.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/create" className="w-full">
              <Button className="w-full">Create Loan</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Browse Loans</CardTitle>
            <CardDescription>Explore all available loan tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Browse all loan tokens created on the platform.
              View details, risk assessments, and blockchain information.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/feed" className="w-full">
              <Button variant="outline" className="w-full">View Feed</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function DappContent() {
  const { isConnected } = useAccount();
  const { isConnectedToCorrectChain } = useNetworkInfo();

  if (!isConnected) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to LoanChain</CardTitle>
          <CardDescription>The future of decentralized lending</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Connect your wallet to access the platform's features. LoanChain
            provides decentralized loans with transparent terms and competitive
            rates.
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            LoanChain runs on the Moonbase Alpha testnet. You'll need to connect
            a compatible wallet like MetaMask to continue.
          </p>
        </CardFooter>
      </Card>
    );
  }

  if (!isConnectedToCorrectChain) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Wrong Network</CardTitle>
          <CardDescription>
            Please switch to Moonbase Alpha testnet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p>
              LoanChain is built on Moonbase Alpha testnet. Please switch to the
              correct network to access the platform.
            </p>
            <div className="flex justify-center">
              <NetworkSwitch />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Network Details:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Network Name: Moonbase Alpha</li>
              <li>Chain ID: 1287</li>
              <li>RPC URL: https://rpc.api.moonbase.moonbeam.network</li>
              <li>Currency Symbol: DEV</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // When connected to the correct network, show the application with routing
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<LoanCreationWizard />} />
      <Route path="/feed" element={<LoanFeed />} />
      <Route path="/token/:id" element={<TokenDetail />} />
      <Route path="/transactions" element={<TransactionHistoryPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Token detail page wrapper that extracts the ID from URL params
function TokenDetail() {
  const params = new URL(window.location.href).pathname.split('/');
  const tokenId = params[params.length - 1];
  
  return <TokenDetailView tokenId={tokenId} />;
}

function AppContent() {
  const [showFixer, setShowFixer] = useState(false);
  const [walletError, setWalletError] = useState(true);
  const [initialDetectionDone, setInitialDetectionDone] = useState(false);
  const { isConnected } = useAccount();

  const handleRefresh = () => {
    window.location.reload();
  };

  // Effect to detect MetaMask connection on page load
  useEffect(() => {
    const detectExistingConnection = async () => {
      try {
        // Check if we have an Ethereum provider
        if (typeof window !== "undefined" && window.ethereum) {
          // Get accounts to check if already connected
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          const isConnectedToMetaMask = accounts && accounts.length > 0;

          // If MetaMask is connected but wagmi doesn't reflect this
          if (isConnectedToMetaMask && !isConnected) {
            setWalletError(true);
            console.log(
              "MetaMask appears to be connected but application state doesn't reflect this",
            );
          } else {
            setWalletError(false);
          }
        }
      } catch (err) {
        console.error("Error detecting MetaMask connection:", err);
      } finally {
        setInitialDetectionDone(true);
      }
    };

    detectExistingConnection();
  }, [isConnected]);

  // Hide error when fixer is shown or when connected
  useEffect(() => {
    if (showFixer || isConnected) {
      setWalletError(false);
    }
  }, [showFixer, isConnected]);

  return (
    <Layout>
      <div className="flex flex-col items-center gap-8">
        {/* Connection helper toggle */}
        <div className="w-full max-w-3xl flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFixer(!showFixer)}
            className="text-xs"
          >
            {showFixer ? "Hide" : "Show"} Connection Helper
          </Button>
        </div>

        {/* MetaMask connection helper */}
        {showFixer && <MetaMaskFixer onConnect={handleRefresh} />}

        {/* Show wallet error message if needed */}
        {walletError && !showFixer && initialDetectionDone && (
          <Card className="w-full max-w-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3">
                <p className="text-yellow-800 dark:text-yellow-300">
                  Wallet connection might be required. Use the Connection Helper
                  to synchronize.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFixer(true)}
                  className="bg-yellow-100 dark:bg-yellow-900/40"
                >
                  Show Connection Helper
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <DappContent />
      </div>
    </Layout>
  );
}

function App() {
  return (
    <>
      <WagmiProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </WagmiProvider>
      <Toaster />
    </>
  );
}

export default App;
