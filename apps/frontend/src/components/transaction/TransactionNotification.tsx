import { ReactNode } from "react";
import { TransactionStatus, TransactionType } from "@/lib/contract-integration/transaction.service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionNotificationProps {
  status: TransactionStatus;
  type: TransactionType;
  hash?: string;
  error?: string;
  onDismiss?: () => void;
}

export function TransactionNotification({
  status,
  type,
  hash,
  error,
  onDismiss,
}: TransactionNotificationProps) {
  // Transaction type to human-readable title
  const getTransactionTitle = (type: TransactionType): string => {
    switch (type) {
      case TransactionType.MINT:
        return "Minting Loan Token";
      case TransactionType.REPAY:
        return "Repaying Loan";
      case TransactionType.CANCEL:
        return "Cancelling Loan";
      case TransactionType.UPDATE:
        return "Updating Loan";
      case TransactionType.TRANSFER:
        return "Transferring Loan";
      default:
        return "Transaction";
    }
  };

  // Status to icon mapping
  const getStatusIcon = (status: TransactionStatus): ReactNode => {
    switch (status) {
      case TransactionStatus.PENDING:
        return <Clock className="h-4 w-4 text-amber-500" />;
      case TransactionStatus.MINING:
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case TransactionStatus.SUCCESS:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case TransactionStatus.FAILED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case TransactionStatus.CANCELLED:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Status to variant mapping
  const getStatusVariant = (status: TransactionStatus): "default" | "destructive" => {
    switch (status) {
      case TransactionStatus.FAILED:
        return "destructive";
      default:
        return "default";
    }
  };

  // Status to message mapping
  const getStatusMessage = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return "Transaction pending. Waiting for confirmation...";
      case TransactionStatus.MINING:
        return "Transaction submitted. Waiting for it to be mined...";
      case TransactionStatus.SUCCESS:
        return "Transaction successful!";
      case TransactionStatus.FAILED:
        return error || "Transaction failed. Please try again.";
      case TransactionStatus.CANCELLED:
        return "Transaction cancelled.";
      default:
        return "Transaction status unknown.";
    }
  };

  const title = getTransactionTitle(type);
  const icon = getStatusIcon(status);
  const variant = getStatusVariant(status);
  const message = getStatusMessage(status);
  
  return (
    <Alert variant={variant} className="mb-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 pt-1">{icon}</div>
        <div className="flex-grow">
          <AlertTitle className="flex items-center gap-2">
            {title}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {message}
            
            {hash && status === TransactionStatus.SUCCESS && (
              <div className="mt-2">
                <a
                  href={`https://moonbase.moonscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm"
                >
                  View on Explorer
                </a>
              </div>
            )}
          </AlertDescription>
        </div>
        
        {onDismiss && (status === TransactionStatus.SUCCESS || status === TransactionStatus.FAILED || status === TransactionStatus.CANCELLED) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        )}
      </div>
    </Alert>
  );
} 