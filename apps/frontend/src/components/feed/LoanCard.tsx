import { Link } from "react-router-dom";
import { LoanSummary } from "@/lib/contract-integration/feed.service";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LoanCardProps {
  loan: LoanSummary;
}

export function LoanCard({ loan }: LoanCardProps) {
  const { id, amount, interestRate, term, riskAssessment } = loan;
  
  const getRiskColor = (risk: string = "Medium Risk") => {
    if (risk.toLowerCase().includes("low")) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    } else if (
      risk.toLowerCase().includes("medium") ||
      risk.toLowerCase().includes("standard")
    ) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    } else if (risk.toLowerCase().includes("high")) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    } else {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Loan #{id}</CardTitle>
        <Badge className={getRiskColor(riskAssessment)}>
          {riskAssessment || "Standard Risk"}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">${amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Interest:</span>
            <span className="font-medium">{interestRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Term:</span>
            <span className="font-medium">{term} months</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Link to={`/token/${id}`} className="w-full">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 