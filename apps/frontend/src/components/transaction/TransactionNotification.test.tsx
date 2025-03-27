import { describe, it, expect, vi } from 'vitest';
import { TransactionNotification } from './TransactionNotification';
import { render, screen } from '@/test/test-utils';
import { TransactionStatus, TransactionType } from '@/lib/contract-integration/transaction.service';

describe('TransactionNotification component', () => {
  it('renders correctly with pending status', () => {
    render(
      <TransactionNotification 
        status={TransactionStatus.PENDING} 
        type={TransactionType.MINT} 
      />
    );
    
    expect(screen.getByText('Minting Loan Token')).toBeInTheDocument();
    expect(screen.getByText('Transaction pending. Waiting for confirmation...')).toBeInTheDocument();
  });

  it('renders correctly with mining status', () => {
    render(
      <TransactionNotification 
        status={TransactionStatus.MINING} 
        type={TransactionType.REPAY} 
      />
    );
    
    expect(screen.getByText('Repaying Loan')).toBeInTheDocument();
    expect(screen.getByText('Transaction submitted. Waiting for it to be mined...')).toBeInTheDocument();
  });

  it('renders correctly with success status', () => {
    render(
      <TransactionNotification 
        status={TransactionStatus.SUCCESS} 
        type={TransactionType.CANCEL} 
        hash="0x1234567890abcdef"
      />
    );
    
    expect(screen.getByText('Cancelling Loan')).toBeInTheDocument();
    expect(screen.getByText('Transaction successful!')).toBeInTheDocument();
    
    // Should show explorer link when hash is provided and status is success
    const link = screen.getByText('View on Explorer');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://moonbase.moonscan.io/tx/0x1234567890abcdef');
  });

  it('renders correctly with failed status', () => {
    const errorMessage = 'Not enough funds to complete transaction';
    render(
      <TransactionNotification 
        status={TransactionStatus.FAILED} 
        type={TransactionType.UPDATE}
        error={errorMessage}
      />
    );
    
    expect(screen.getByText('Updating Loan')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('uses a default error message when error is not provided with failed status', () => {
    render(
      <TransactionNotification 
        status={TransactionStatus.FAILED} 
        type={TransactionType.UPDATE}
      />
    );
    
    expect(screen.getByText('Transaction failed. Please try again.')).toBeInTheDocument();
  });

  it('renders correctly with cancelled status', () => {
    render(
      <TransactionNotification 
        status={TransactionStatus.CANCELLED} 
        type={TransactionType.TRANSFER} 
      />
    );
    
    expect(screen.getByText('Transferring Loan')).toBeInTheDocument();
    expect(screen.getByText('Transaction cancelled.')).toBeInTheDocument();
  });

  it('shows a dismiss button for completed transactions', () => {
    const handleDismiss = vi.fn();
    render(
      <TransactionNotification 
        status={TransactionStatus.SUCCESS} 
        type={TransactionType.MINT}
        onDismiss={handleDismiss}
      />
    );
    
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    expect(dismissButton).toBeInTheDocument();
    dismissButton.click();
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not show a dismiss button for in-progress transactions', () => {
    const handleDismiss = vi.fn();
    render(
      <TransactionNotification 
        status={TransactionStatus.MINING} 
        type={TransactionType.MINT}
        onDismiss={handleDismiss}
      />
    );
    
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });

  it('does not show explorer link for non-success statuses', () => {
    render(
      <TransactionNotification 
        status={TransactionStatus.FAILED} 
        type={TransactionType.MINT}
        hash="0x1234567890abcdef"
      />
    );
    
    expect(screen.queryByText('View on Explorer')).not.toBeInTheDocument();
  });

  it('handles unknown transaction types gracefully', () => {
    render(
      <TransactionNotification 
        status={TransactionStatus.SUCCESS} 
        // @ts-expect-error Testing with invalid type
        type="UNKNOWN_TYPE" 
      />
    );
    
    expect(screen.getByText('Transaction')).toBeInTheDocument();
  });
}); 