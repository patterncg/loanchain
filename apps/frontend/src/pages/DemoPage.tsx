import { TransactionNotification } from "@/components/transaction/TransactionNotification";
import { TransactionHistory } from "@/components/transaction/TransactionHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransaction } from "@/hooks/useTransaction";
import { TransactionStatus } from "@/lib/contract-integration/transaction.service";

export function DemoPage() {
  const { 
    mintLoanToken, 
    executeTransaction, 
    currentTransaction, 
    clearCurrentTransaction,
    transactions 
  } = useTransaction();

  // Mock data for demo transactions
  const mockMetadataURI = "ipfs://QmYbcDi7CeemrW6HhD8LiUQoETeJU2spqRfD7NYmAFZ7P7";
  const mockLoanData = {
    amount: 10000,
    interestRate: 5.5,
    term: 12,
    purpose: "Demo Loan",
    collateralType: "Demo",
    collateralValue: 15000,
    id: `demo-${Date.now()}`,
    issuer: "0x0000000000000000000000000000000000000000",
    timestamp: Date.now(),
    aiSummary: "Demo loan for transaction testing",
    riskTag: "Demo Risk",
    loanTermsDocumentUrl: "https://example.com/demo-terms",
  };

  // Demo functions to trigger different transaction statuses
  const triggerPendingTransaction = () => {
    executeTransaction({
      description: "Demo Pending Transaction",
      type: "demo",
      metadata: { demoType: "pending" }
    }, async () => {
      // This promise intentionally doesn't resolve to keep the transaction pending
      return new Promise(() => {
        // In a real scenario, this would be a blockchain transaction that's submitted
        // but never completes in our demo timeframe
        setTimeout(() => {
          console.log("This transaction would normally be pending");
        }, 100000);
      });
    });
  };

  const triggerSuccessTransaction = () => {
    executeTransaction({
      description: "Demo Success Transaction",
      type: "demo",
      metadata: { demoType: "success", tokenId: Math.floor(Math.random() * 1000) }
    }, async () => {
      // Simulate a successful transaction
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            status: "success",
            transactionHash: `0x${Math.random().toString(16).slice(2)}`,
            tokenId: Math.floor(Math.random() * 1000).toString(),
          });
        }, 2000);
      });
    });
  };

  const triggerFailedTransaction = () => {
    executeTransaction({
      description: "Demo Failed Transaction",
      type: "demo",
      metadata: { demoType: "failure" }
    }, async () => {
      // Simulate a failed transaction
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Demo transaction failed"));
        }, 2000);
      });
    });
  };

  const triggerMintingTransaction = () => {
    // Use the actual mintLoanToken function with mock data
    mintLoanToken(
      "0xDemoAddress",
      mockMetadataURI,
      mockLoanData
    );
  };

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Transaction System Demo</h1>
      <p className="text-muted-foreground">
        This page demonstrates the various components of the transaction system.
      </p>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="triggers">Transaction Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Notifications</CardTitle>
              <CardDescription>
                Real-time notifications for blockchain transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentTransaction ? (
                <TransactionNotification
                  status={currentTransaction.status}
                  type={currentTransaction.type}
                  hash={currentTransaction.hash}
                  error={currentTransaction.error}
                  onDismiss={clearCurrentTransaction}
                />
              ) : (
                <div className="bg-muted p-4 rounded-md text-center">
                  <p>No active transaction. Trigger a transaction to see the notification.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Status Reference</CardTitle>
              <CardDescription>
                Examples of different transaction notification states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TransactionNotification
                status={TransactionStatus.PENDING}
                type="demo"
                hash="0xDemo123Pending"
                onDismiss={() => {}}
              />
              
              <TransactionNotification
                status={TransactionStatus.SUCCESS}
                type="mint"
                hash="0xDemo123Success"
                onDismiss={() => {}}
              />
              
              <TransactionNotification
                status={TransactionStatus.FAILED}
                type="demo"
                hash="0xDemo123Failed"
                error="Example transaction error message"
                onDismiss={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View your recent blockchain transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionHistory
                transactions={transactions}
                limit={10}
                showFilters={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trigger Demo Transactions</CardTitle>
              <CardDescription>
                Create different types of transactions to see how the system responds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border p-4 rounded-md space-y-2">
                  <h3 className="font-medium">Minting Transaction</h3>
                  <p className="text-sm text-muted-foreground">
                    Simulates minting a loan token with redirect functionality
                  </p>
                  <Button onClick={triggerMintingTransaction}>Mint Token</Button>
                </div>
                
                <div className="bg-card border p-4 rounded-md space-y-2">
                  <h3 className="font-medium">Pending Transaction</h3>
                  <p className="text-sm text-muted-foreground">
                    Creates a transaction that remains in pending state
                  </p>
                  <Button variant="outline" onClick={triggerPendingTransaction}>Create Pending</Button>
                </div>
                
                <div className="bg-card border p-4 rounded-md space-y-2">
                  <h3 className="font-medium">Success Transaction</h3>
                  <p className="text-sm text-muted-foreground">
                    Creates a transaction that completes successfully
                  </p>
                  <Button variant="outline" className="bg-green-50" onClick={triggerSuccessTransaction}>
                    Create Success
                  </Button>
                </div>
                
                <div className="bg-card border p-4 rounded-md space-y-2">
                  <h3 className="font-medium">Failed Transaction</h3>
                  <p className="text-sm text-muted-foreground">
                    Creates a transaction that fails with an error
                  </p>
                  <Button variant="outline" className="bg-red-50" onClick={triggerFailedTransaction}>
                    Create Failed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DemoPage; 