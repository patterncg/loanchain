import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionRecord, TransactionStatus, TransactionType } from "@/lib/contract-integration/transaction.service";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface TransactionHistoryProps {
  transactions: TransactionRecord[];
  maxHeight?: string;
}

export function TransactionHistory({ transactions, maxHeight = "300px" }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent blockchain transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No transactions found
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transaction type to human-readable text
  const getTransactionLabel = (type: TransactionType): string => {
    switch (type) {
      case TransactionType.MINT:
        return "Mint Loan Token";
      case TransactionType.REPAY:
        return "Repay Loan";
      case TransactionType.CANCEL:
        return "Cancel Loan";
      case TransactionType.UPDATE:
        return "Update Loan";
      case TransactionType.TRANSFER:
        return "Transfer Loan";
      default:
        return "Transaction";
    }
  };

  // Status to icon mapping
  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.SUCCESS:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case TransactionStatus.FAILED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case TransactionStatus.MINING:
      case TransactionStatus.PENDING:
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Recent blockchain transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`max-h-[${maxHeight}]`}>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getStatusIcon(tx.status)}</div>
                  <div>
                    <div className="font-medium">{getTransactionLabel(tx.type)}</div>
                    <div className="text-xs text-muted-foreground">
                      {tx.timestamp
                        ? formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })
                        : "Unknown time"}
                    </div>
                    {tx.tokenId && (
                      <Link
                        to={`/token/${tx.tokenId}`}
                        className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                      >
                        Token #{tx.tokenId}
                      </Link>
                    )}
                  </div>
                </div>
                
                {tx.hash && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    asChild
                  >
                    <a
                      href={`https://moonbase.moonscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 