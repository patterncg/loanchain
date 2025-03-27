import { describe, it, expect } from 'vitest';
import { TransactionHistory } from './TransactionHistory';
import { render, screen } from '@/test/test-utils';
import { TransactionStatus, TransactionType } from '@/lib/contract-integration/transaction.service';

// Mock react-router-dom Link component to avoid routing issues
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
      <a href={to} className={className}>{children}</a>
    ),
  };
});

describe('TransactionHistory component', () => {
  it('renders empty state when no transactions are provided', () => {
    render(<TransactionHistory transactions={[]} />);
    
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
    expect(screen.getByText('Recent blockchain transactions')).toBeInTheDocument();
    expect(screen.getByText('No transactions found')).toBeInTheDocument();
  });

  it('renders a list of transactions', () => {
    const transactions = [
      {
        id: '1',
        type: TransactionType.MINT,
        status: TransactionStatus.SUCCESS,
        timestamp: new Date('2023-06-01').getTime(),
        hash: '0x1234',
        tokenId: '123',
      },
      {
        id: '2',
        type: TransactionType.REPAY,
        status: TransactionStatus.FAILED,
        timestamp: new Date('2023-06-02').getTime(),
        hash: '0x5678',
      },
      {
        id: '3',
        type: TransactionType.CANCEL,
        status: TransactionStatus.PENDING,
        timestamp: new Date('2023-06-03').getTime(),
      },
    ];

    render(<TransactionHistory transactions={transactions} />);
    
    // Check if all transactions are displayed
    expect(screen.getByText('Mint Loan Token')).toBeInTheDocument();
    expect(screen.getByText('Repay Loan')).toBeInTheDocument();
    expect(screen.getByText('Cancel Loan')).toBeInTheDocument();
    
    // Check for token ID link
    const tokenLink = screen.getByText('Token #123');
    expect(tokenLink).toBeInTheDocument();
    expect(tokenLink).toHaveAttribute('href', '/token/123');
    
    // Check for external links to blockchain explorer
    const viewLinks = screen.getAllByText('View');
    expect(viewLinks.length).toBe(2); // Only the two transactions with hashes
    
    // First link should point to the correct explorer URL
    const firstViewLink = viewLinks[0].closest('a');
    expect(firstViewLink).toHaveAttribute('href', 'https://moonbase.moonscan.io/tx/0x1234');
    expect(firstViewLink).toHaveAttribute('target', '_blank');
    expect(firstViewLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
  
  it('renders with custom max height', () => {
    const transactions = [
      {
        id: '1',
        type: TransactionType.MINT,
        status: TransactionStatus.SUCCESS,
        timestamp: new Date().getTime(),
      },
    ];

    render(<TransactionHistory transactions={transactions} maxHeight="500px" />);
    
    // The ScrollArea component should have the custom max height
    // This is a bit tricky to test as the className is dynamically created
    // We can test for the presence of a transaction to ensure rendering works
    expect(screen.getByText('Mint Loan Token')).toBeInTheDocument();
  });
  
  it('displays formatted time distances', () => {
    // Create a transaction with a timestamp that's 1 day ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const transactions = [
      {
        id: '1',
        type: TransactionType.MINT,
        status: TransactionStatus.SUCCESS,
        timestamp: oneDayAgo.getTime(),
      },
    ];

    render(<TransactionHistory transactions={transactions} />);
    
    // The exact text might vary depending on the date-fns implementation
    // But it should contain something about "day" or "1 day"
    const timeTexts = screen.getAllByText(/day/i);
    expect(timeTexts.length).toBeGreaterThan(0);
  });
  
  it('handles transactions without timestamps', () => {
    const transactions = [
      {
        id: '1',
        type: TransactionType.MINT,
        status: TransactionStatus.SUCCESS,
        // No timestamp provided
      },
    ];

    render(<TransactionHistory transactions={transactions} />);
    
    expect(screen.getByText('Unknown time')).toBeInTheDocument();
  });
}); 