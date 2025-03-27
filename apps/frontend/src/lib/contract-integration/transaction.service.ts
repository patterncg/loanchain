import { ContractService } from "./contract.service";
import { EnhancedLoanData } from "./types";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Transaction status enum
 */
export enum TransactionStatus {
  PENDING = "pending",
  MINING = "mining",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

/**
 * Transaction type enum
 */
export enum TransactionType {
  MINT = "mint",
  REPAY = "repay",
  CANCEL = "cancel",
  UPDATE = "update",
  TRANSFER = "transfer",
}

/**
 * Transaction record interface
 */
export interface TransactionRecord {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  hash?: string;
  tokenId?: string;
  timestamp: number;
  error?: string;
  blockNumber?: number;
  from?: string;
  to?: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Transaction result interface
 */
export interface TransactionResult {
  hash?: string;
  transactionHash?: string;
  tokenId?: string;
  blockNumber?: number;
  [key: string]: unknown;
}

/**
 * Transaction store interface
 */
interface TransactionStore {
  transactions: Record<string, TransactionRecord>;
  addTransaction: (transaction: TransactionRecord) => void;
  updateTransaction: (id: string, updates: Partial<TransactionRecord>) => void;
  clearTransactions: () => void;
}

/**
 * Transaction store using Zustand
 */
export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: {},
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: {
            ...state.transactions,
            [transaction.id]: transaction,
          },
        })),
      updateTransaction: (id, updates) =>
        set((state) => {
          if (!state.transactions[id]) return state;
          return {
            transactions: {
              ...state.transactions,
              [id]: {
                ...state.transactions[id],
                ...updates,
              },
            },
          };
        }),
      clearTransactions: () => set({ transactions: {} }),
    }),
    {
      name: 'loanchain-transactions',
    }
  )
);

/**
 * Transaction service to handle blockchain transactions
 */
export class TransactionService {
  private contractService: ContractService;
  private subscribers: ((transaction: TransactionRecord) => void)[] = [];
  
  constructor() {
    this.contractService = new ContractService({
      chainId: 1287, // Moonbase Alpha
      loanRegistryAddress: import.meta.env.VITE_LOAN_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000"
    });
    
    // Subscribe to store changes to notify subscribers
    const originalAddTransaction = useTransactionStore.getState().addTransaction;
    const originalUpdateTransaction = useTransactionStore.getState().updateTransaction;
    
    useTransactionStore.setState({
      addTransaction: (transaction: TransactionRecord) => {
        originalAddTransaction(transaction);
        this.notifySubscribers(transaction);
      },
      updateTransaction: (id: string, updates: Partial<TransactionRecord>) => {
        originalUpdateTransaction(id, updates);
        const updatedTransaction = useTransactionStore.getState().transactions[id];
        if (updatedTransaction) {
          this.notifySubscribers(updatedTransaction);
        }
      }
    });
  }
  
  /**
   * Subscribe to transaction updates
   * @param callback Function to call when a transaction is updated
   * @returns Unsubscribe function
   */
  subscribe(callback: (transaction: TransactionRecord) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
  
  /**
   * Notify subscribers of a transaction update
   * @param transaction Updated transaction
   */
  private notifySubscribers(transaction: TransactionRecord): void {
    this.subscribers.forEach(callback => {
      try {
        callback(transaction);
      } catch (error) {
        console.error('Error notifying transaction subscriber:', error);
      }
    });
  }
  
  /**
   * Generate a unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Execute a transaction and track its status
   * @param type Transaction type
   * @param operation Function that executes the transaction
   * @param metadata Additional metadata to store with the transaction
   * @returns Transaction record
   */
  async executeTransaction<T>(
    type: TransactionType,
    operation: () => Promise<T>,
    metadata: Record<string, unknown> = {}
  ): Promise<{ result: T | null; transaction: TransactionRecord }> {
    // Create transaction record
    const transactionId = this.generateTransactionId();
    const transactionRecord: TransactionRecord = {
      id: transactionId,
      type,
      status: TransactionStatus.PENDING,
      timestamp: Date.now(),
      metadata,
    };
    
    // Add transaction to store
    useTransactionStore.getState().addTransaction(transactionRecord);
    
    try {
      // Update status to mining
      useTransactionStore.getState().updateTransaction(transactionId, {
        status: TransactionStatus.MINING,
      });
      
      // Execute transaction
      const result = await operation();
      
      // Update transaction with success and extract transaction data
      const txResult = result as unknown as TransactionResult;
      
      // Extract token ID - look in multiple possible locations
      let tokenId: string | undefined = undefined;
      
      if (txResult?.tokenId) {
        // Direct tokenId property
        tokenId = String(txResult.tokenId);
      } else if (typeof txResult?.events === 'object' && txResult?.events !== null) {
        // Look in events for Transfer event or similar
        const events = txResult.events as Record<string, unknown>;
        
        // Check for nft transfer events which often contain tokenId
        for (const eventName in events) {
          if (
            eventName.includes('Transfer') || 
            eventName.includes('Mint') || 
            eventName.includes('Token')
          ) {
            const event = events[eventName] as Record<string, unknown>;
            if (event?.tokenId) {
              tokenId = String(event.tokenId);
            } else if (event?.args && typeof event.args === 'object' && event.args !== null) {
              const args = event.args as Record<string, unknown>;
              if (args.tokenId) {
                tokenId = String(args.tokenId);
              } else if (args.id) {
                tokenId = String(args.id);
              }
            }
          }
        }
      } else if (txResult?.logs && Array.isArray(txResult.logs)) {
        // Look through transaction logs
        for (const log of txResult.logs) {
          const typedLog = log as { name?: string; args?: Record<string, unknown> };
          if (typedLog.name?.includes('Transfer') && typedLog.args?.tokenId) {
            tokenId = String(typedLog.args.tokenId);
          }
        }
      }
      
      // If a token ID is found in the metadata (usually for mock transactions), use that as fallback
      if (!tokenId && metadata.tokenId) {
        tokenId = String(metadata.tokenId);
      }
      
      useTransactionStore.getState().updateTransaction(transactionId, {
        status: TransactionStatus.SUCCESS,
        hash: txResult?.hash || txResult?.transactionHash,
        tokenId,
        blockNumber: txResult?.blockNumber as number | undefined,
      });
      
      return { 
        result, 
        transaction: { 
          ...transactionRecord, 
          status: TransactionStatus.SUCCESS,
          hash: txResult?.hash || txResult?.transactionHash,
          tokenId,
          blockNumber: txResult?.blockNumber as number | undefined,
        } 
      };
    } catch (error) {
      console.error("Transaction failed:", error);
      
      // Update transaction with failure
      useTransactionStore.getState().updateTransaction(transactionId, {
        status: TransactionStatus.FAILED,
        error: error instanceof Error ? error.message : String(error),
      });
      
      return { 
        result: null, 
        transaction: { 
          ...transactionRecord, 
          status: TransactionStatus.FAILED,
          error: error instanceof Error ? error.message : String(error),
        } 
      };
    }
  }

  /**
   * Mint a loan token
   * @param address User wallet address
   * @param metadataURI IPFS URI of the metadata
   * @param loanData Loan data
   * @returns Transaction result
   */
  async mintLoanToken(address: string, metadataURI: string, loanData: EnhancedLoanData) {
    return this.executeTransaction(
      TransactionType.MINT,
      () => this.contractService.mintLoanToken(address, metadataURI, loanData),
      { address, metadataURI, loanData }
    );
  }

  /**
   * Repay a loan
   * @param tokenId Token ID
   * @param address User address
   * @returns Transaction result
   */
  async repayLoan(tokenId: string, address: string) {
    return this.executeTransaction(
      TransactionType.REPAY,
      // Note: This is a mock implementation
      () => Promise.resolve({ tokenId, hash: `mock-hash-${Date.now()}` }),
      { tokenId, address }
    );
  }

  /**
   * Cancel a loan
   * @param tokenId Token ID
   * @param address User address
   * @returns Transaction result
   */
  async cancelLoan(tokenId: string, address: string) {
    return this.executeTransaction(
      TransactionType.CANCEL,
      // Note: This is a mock implementation
      () => Promise.resolve({ tokenId, hash: `mock-hash-${Date.now()}` }),
      { tokenId, address }
    );
  }

  /**
   * Get all transactions for a user
   * @param address User address
   * @returns Array of transaction records
   */
  getUserTransactions(address: string): TransactionRecord[] {
    const { transactions } = useTransactionStore.getState();
    return Object.values(transactions)
      .filter(tx => tx.metadata?.address === address)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get all transactions for a token
   * @param tokenId Token ID
   * @returns Array of transaction records
   */
  getTokenTransactions(tokenId: string): TransactionRecord[] {
    const { transactions } = useTransactionStore.getState();
    return Object.values(transactions)
      .filter(tx => tx.tokenId === tokenId || tx.metadata?.tokenId === tokenId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get transaction by ID
   * @param id Transaction ID
   * @returns Transaction record or undefined
   */
  getTransaction(id: string): TransactionRecord | undefined {
    const { transactions } = useTransactionStore.getState();
    return transactions[id];
  }

  /**
   * Get pending transactions
   * @returns Array of pending transaction records
   */
  getPendingTransactions(): TransactionRecord[] {
    const { transactions } = useTransactionStore.getState();
    return Object.values(transactions)
      .filter(tx => tx.status === TransactionStatus.PENDING || tx.status === TransactionStatus.MINING)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get all transaction history
   * @returns Array of transaction records
   */
  getTransactionHistory(): TransactionRecord[] {
    const { transactions } = useTransactionStore.getState();
    return Object.values(transactions)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
} 