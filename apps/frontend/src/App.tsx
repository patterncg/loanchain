import { WagmiProvider } from "./providers/WagmiProvider";
import { Layout } from "./components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAccount } from "wagmi";
import { useNetworkInfo } from "./hooks/useNetworkInfo";
import { NetworkSwitch } from "./components/layout/NetworkSwitch";

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

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Connected to LoanChain</CardTitle>
        <CardDescription>Ready to use the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          You're now connected to LoanChain on Moonbase Alpha. You can now
          access the platform's features and manage your loans.
        </p>
      </CardContent>
    </Card>
  );
}

function App() {
  return (
    <WagmiProvider>
      <Layout>
        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">LoanChain</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              A decentralized lending platform on Moonbeam
            </p>
          </div>

          <DappContent />
        </div>
      </Layout>
    </WagmiProvider>
  );
}

export default App;
