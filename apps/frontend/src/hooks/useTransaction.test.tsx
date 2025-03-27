import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTransaction } from './useTransaction';
import { TransactionStatus, TransactionType, type TransactionRecord } from '@/lib/contract-integration/transaction.service';

// Create mock implementation for TransactionService
const mockTransactionService = {
  getTransactionHistory: vi.fn().mockResolvedValue([]),
  mintLoanToken: vi.fn(),
  subscribe: vi.fn().mockImplementation((callback) => {
    return () => {};
  }),
};

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/lib/contract-integration/transaction.service', () => ({
  TransactionService: vi.fn(() => mockTransactionService),
  TransactionStatus: {
    PENDING: 'pending',
    MINING: 'mining',
    SUCCESS: 'success',
    FAILED: 'failed',
  },
  TransactionType: {
    MINT: 'mint',
    REPAY: 'repay',
    CANCEL: 'cancel',
    UPDATE: 'update',
  },
}));

vi.mock('@/test/test-utils', () => ({
  useTestServices: vi.fn(() => {
    throw new Error('Not in test context');
  }),
}));

describe('useTransaction hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with empty transactions', () => {
    const { result } = renderHook(() => useTransaction());
    expect(result.current.transactions).toEqual([]);
    expect(result.current.currentTransaction).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should provide a mintLoanToken function', () => {
    const { result } = renderHook(() => useTransaction());
    expect(typeof result.current.mintLoanToken).toBe('function');
  });

  it('should provide a redirectToToken function', () => {
    const { result } = renderHook(() => useTransaction());
    expect(typeof result.current.redirectToToken).toBe('function');
  });

  it('should provide a clearCurrentTransaction function', () => {
    const { result } = renderHook(() => useTransaction());
    expect(typeof result.current.clearCurrentTransaction).toBe('function');
  });
}); 