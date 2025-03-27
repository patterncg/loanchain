import { useState, useCallback, useEffect } from "react";
import { TransactionService, TransactionRecord, TransactionStatus } from "@/lib/contract-integration/transaction.service";
import { useToast } from "@/components/ui/use-toast";
import { EnhancedLoanData } from "@/lib/contract-integration/types";
import { useNavigate } from "react-router-dom";

/**
 * Hook for managing blockchain transactions
 */
export function useTransaction() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize the transaction service
  const transactionService = new TransactionService();

  // Load transaction history on mount
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const history = await transactionService.getTransactionHistory();
        setTransactions(history);
      } catch (error) {
        console.error("Failed to load transaction history:", error);
      }
    };

    loadTransactions();
  }, []);

  // Subscribe to transaction updates
  useEffect(() => {
    const unsubscribe = transactionService.subscribe((updatedTx) => {
      setTransactions((prevTxs) => {
        // Update the transaction in the list if it exists
        const exists = prevTxs.some((tx) => tx.id === updatedTx.id);
        if (exists) {
          return prevTxs.map((tx) => 
            tx.id === updatedTx.id ? updatedTx : tx
          );
        }
        // Add the new transaction
        return [updatedTx, ...prevTxs];
      });

      // Update current transaction if it's the same one
      if (currentTransaction?.id === updatedTx.id) {
        setCurrentTransaction(updatedTx);
      }

      // Show toast notifications for status changes
      if (updatedTx.status === TransactionStatus.SUCCESS) {
        toast({
          title: "Transaction Successful",
          description: `Your transaction has been confirmed.`,
          variant: "default",
        });
        
        // If the transaction has a tokenId, we can redirect to its details page
        if (updatedTx.tokenId && updatedTx.type === "mint") {
          toast({
            title: "Redirecting...",
            description: `Taking you to your newly minted token #${updatedTx.tokenId}`,
            variant: "default",
          });
          
          // Add a small delay to allow the user to see the success message
          setTimeout(() => {
            navigate(`/token/${updatedTx.tokenId}`);
          }, 1500);
        }
      } else if (updatedTx.status === TransactionStatus.FAILED) {
        toast({
          title: "Transaction Failed",
          description: updatedTx.error || "Transaction failed. Please try again.",
          variant: "destructive",
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentTransaction, toast, navigate]);

  /**
   * Execute a mint transaction 
   */
  const mintLoanToken = useCallback(
    async (address: string, metadataURI: string, loanData: EnhancedLoanData) => {
      setIsLoading(true);
      try {
        const tx = await transactionService.mintLoanToken(address, metadataURI, loanData);
        setCurrentTransaction(tx);
        return tx;
      } catch (error) {
        console.error("Mint transaction failed:", error);
        toast({
          title: "Transaction Error",
          description: (error as Error)?.message || "Failed to start transaction",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * Clear the current transaction
   */
  const clearCurrentTransaction = useCallback(() => {
    setCurrentTransaction(null);
  }, []);

  /**
   * Manually redirect to a token's detail page
   */
  const redirectToToken = useCallback((tokenId: string) => {
    navigate(`/token/${tokenId}`);
  }, [navigate]);

  return {
    transactions,
    currentTransaction,
    isLoading,
    mintLoanToken,
    clearCurrentTransaction,
    redirectToToken,
  };
} 