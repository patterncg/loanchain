import { Badge } from "@/components/ui/badge";

type LoanStatus = "Active" | "Repaid" | "Defaulted" | "Liquidated" | "Cancelled";

interface LoanStatusBadgeProps {
  status: LoanStatus;
}

export function LoanStatusBadge({ status }: LoanStatusBadgeProps) {
  const getStatusColor = (status: LoanStatus) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Repaid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Defaulted":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Liquidated":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "Cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  return (
    <Badge className={`${getStatusColor(status)} px-3 py-1 text-xs font-medium`}>
      {status}
    </Badge>
  );
} 