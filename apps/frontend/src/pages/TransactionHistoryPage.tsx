import { useState } from "react";
import { TransactionHistory } from "@/components/transaction/TransactionHistory";
import { useTransaction } from "@/hooks/useTransaction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TransactionHistoryPage() {
  const { transactions } = useTransaction();
  const [activeTab, setActiveTab] = useState<string>("all");

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return tx.status === "pending" || tx.status === "mining";
    if (activeTab === "completed") return tx.status === "success";
    if (activeTab === "failed") return tx.status === "failed" || tx.status === "cancelled";
    return true;
  });

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">
          View and track your blockchain transactions
        </p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <TransactionHistory 
            transactions={filteredTransactions} 
            maxHeight="500px" 
          />
        </TabsContent>
      </Tabs>
      
      {transactions.length > 0 && (
        <div className="text-sm text-muted-foreground mt-4">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      )}
    </div>
  );
} 