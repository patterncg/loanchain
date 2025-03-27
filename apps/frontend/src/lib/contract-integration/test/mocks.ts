import { vi } from 'vitest';
import { TransactionStatus, TransactionType, type TransactionRecord } from '../transaction.service';
import { EnhancedLoanData } from '../types';

// Mock transaction service
export const createMockTransactionService = () => {
  // Create initial mock state
  const mockState: {
    transactions: TransactionRecord[];
    subscriberCallbacks: ((tx: TransactionRecord) => void)[];
  } = {
    transactions: [],
    subscriberCallbacks: [],
  };

  return {
    // Mock methods
    getTransactionHistory: vi.fn(() => Promise.resolve(mockState.transactions)),
    
    mintLoanToken: vi.fn((address: string, metadataURI: string, metadata: EnhancedLoanData) => {
      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        type: TransactionType.MINT,
        status: TransactionStatus.PENDING,
        hash: `0xmockhash${Date.now()}`,
        from: address,
        metadataURI,
        timestamp: Date.now(),
        metadata: metadata as unknown as Record<string, unknown>,
      };
      
      mockState.transactions.push(newTx);
      
      // Notify subscribers
      mockState.subscriberCallbacks.forEach(callback => callback(newTx));
      
      return Promise.resolve(newTx);
    }),
    
    subscribe: vi.fn((callback: (tx: TransactionRecord) => void) => {
      mockState.subscriberCallbacks.push(callback);
      return () => {
        const index = mockState.subscriberCallbacks.indexOf(callback);
        if (index !== -1) {
          mockState.subscriberCallbacks.splice(index, 1);
        }
      };
    }),
    
    // Test helpers for simulating updates
    _simulateTransactionUpdate: (transaction: Partial<TransactionRecord> & { id: string }) => {
      const index = mockState.transactions.findIndex(tx => tx.id === transaction.id);
      
      if (index !== -1) {
        // Update existing transaction
        mockState.transactions[index] = {
          ...mockState.transactions[index],
          ...transaction,
        };
      } else {
        // Add new transaction
        mockState.transactions.push(transaction as TransactionRecord);
      }
      
      // Notify subscribers
      mockState.subscriberCallbacks.forEach(callback => 
        callback(mockState.transactions.find(tx => tx.id === transaction.id) as TransactionRecord)
      );
    },
    
    // Reset state for testing
    _reset: () => {
      mockState.transactions = [];
      mockState.subscriberCallbacks = [];
    }
  };
};

// Mock contract service
export const createMockContractService = () => {
  return {
    connectToContract: vi.fn(() => Promise.resolve(true)),
    isConnected: vi.fn(() => Promise.resolve(true)),
    mintToken: vi.fn(() => Promise.resolve({ hash: '0xmockhash' })),
    getTokenMetadata: vi.fn(() => Promise.resolve({ name: 'Test Token', description: 'Test Description' })),
  };
};

// Mock feed service
export const createMockFeedService = () => {
  return {
    getLoanFeed: vi.fn(() => Promise.resolve([
      { id: '1', amount: 1000, interestRate: 5, term: 12 },
      { id: '2', amount: 2000, interestRate: 7, term: 24 },
    ])),
    getLoanById: vi.fn((id: string) => Promise.resolve({ 
      id, 
      amount: 1000, 
      interestRate: 5, 
      term: 12 
    })),
  };
};

// Mock token detail service
export const createMockTokenDetailService = () => {
  return {
    getTokenDetail: vi.fn((id: string) => Promise.resolve({
      id,
      metadata: {
        amount: 1000,
        interestRate: 5,
        term: 12,
      },
      blockchainInfo: {
        contractAddress: '0xmockaddress',
        tokenId: id,
        ownerAddress: '0xmockowner',
        mintTimestamp: Date.now(),
      }
    })),
  };
}; 