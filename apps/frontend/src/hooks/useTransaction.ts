import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionService, TransactionStatus, type TransactionRecord } from '@/lib/contract-integration/transaction.service';
import { EnhancedLoanData } from '@/lib/contract-integration/types';
import { useToast } from '@/components/ui/use-toast';
import { useTestServices } from '@/test/test-utils';

/**
 * Custom hook for managing transactions
 * Handles transaction lifecycle events and history management
 */
export const useTransaction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Attempt to get services from test context, or create real services
  let transactionService: TransactionService;
  try {
    const services = useTestServices();
    transactionService = services.transactionService as unknown as TransactionService;
  } catch (_) {
    // Not within test context, create real service
    transactionService = new TransactionService();
  }

  // Load transaction history on mount
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const history = await transactionService.getTransactionHistory();
        setTransactions(history);
      } catch (error) {
        console.error('Failed to load transaction history:', error);
      }
    };

    loadTransactions();
  }, [transactionService]);

  // Subscribe to transaction updates
  useEffect(() => {
    // Set up subscription to transaction updates
    const unsubscribe = transactionService.subscribe((updatedTx) => {
      // Update transactions list
      setTransactions((prevTxs) => {
        const index = prevTxs.findIndex((tx) => tx.id === updatedTx.id);
        if (index !== -1) {
          // Update existing transaction
          const newTxs = [...prevTxs];
          newTxs[index] = updatedTx;
          return newTxs;
        } else {
          // Add new transaction
          return [...prevTxs, updatedTx];
        }
      });

      // Update current transaction if it's the same ID
      if (currentTransaction && updatedTx.id === currentTransaction.id) {
        setCurrentTransaction(updatedTx);
      }

      // Handle successful mint with tokenId - redirect to token detail
      if (updatedTx.status === TransactionStatus.SUCCESS && 
          updatedTx.tokenId && 
          updatedTx.type === "mint") {
        
        toast({
          title: "Redirecting...",
          description: `Taking you to your newly minted token #${updatedTx.tokenId}`,
          variant: "default",
        });

        // Redirect to token detail after a short delay
        setTimeout(() => {
          navigate(`/token/${updatedTx.tokenId}`);
        }, 1500);
      }
    });

    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [navigate, toast, currentTransaction, transactionService]);

  // Function to mint a loan token
  const mintLoanToken = useCallback(
    async (address: string, metadataURI: string, metadata: EnhancedLoanData) => {
      setIsLoading(true);
      try {
        const transaction = await transactionService.mintLoanToken(
          address,
          metadataURI,
          metadata
        );
        setCurrentTransaction(transaction);
        setIsLoading(false);
        return transaction;
      } catch (error) {
        console.error('Failed to mint loan token:', error);
        setIsLoading(false);
        throw error;
      }
    },
    [transactionService]
  );

  // Function to clear the current transaction
  const clearCurrentTransaction = useCallback(() => {
    setCurrentTransaction(null);
  }, []);

  // Function to manually redirect to a token detail page
  const redirectToToken = useCallback(
    (tokenId: string) => {
      navigate(`/token/${tokenId}`);
    },
    [navigate]
  );

  return {
    transactions,
    currentTransaction,
    isLoading,
    mintLoanToken,
    clearCurrentTransaction,
    redirectToToken,
  };
}; 