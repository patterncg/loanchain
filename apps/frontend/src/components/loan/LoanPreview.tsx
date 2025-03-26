import { AiEnhancedLoan } from "@/schemas/loan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LoanPreviewProps {
  enhancedData: AiEnhancedLoan;
  isLoading?: boolean;
}

export function LoanPreview({ enhancedData, isLoading = false }: LoanPreviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Loan Preview</h2>
          <p className="text-muted-foreground">
            Analyzing your loan data...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full h-48 bg-muted rounded-md animate-pulse"></div>
          <div className="w-full h-48 bg-muted rounded-md animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!enhancedData) {
    return null;
  }

  const { original, enhanced } = enhancedData;
  const { loanDetails, borrower, terms } = original;

  // Helper function to get risk color
  const getRiskColor = (riskAssessment: string) => {
    switch (riskAssessment) {
      case "Low Risk":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Medium Risk":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "High Risk":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Loan Preview</h2>
        <p className="text-muted-foreground">
          Review your loan details below along with our AI-enhanced analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Loan Data */}
        <Card>
          <CardHeader>
            <CardTitle>Original Loan Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">LOAN DETAILS</h3>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm font-medium">Amount:</p>
                <p className="text-sm">${loanDetails.amount.toLocaleString()}</p>
                
                <p className="text-sm font-medium">Interest Rate:</p>
                <p className="text-sm">{loanDetails.interestRate}%</p>
                
                <p className="text-sm font-medium">Term:</p>
                <p className="text-sm">{loanDetails.term} {loanDetails.termUnit}</p>
                
                <p className="text-sm font-medium">Purpose:</p>
                <p className="text-sm">{loanDetails.purpose}</p>
                
                {loanDetails.collateral && (
                  <>
                    <p className="text-sm font-medium">Collateral:</p>
                    <p className="text-sm">{loanDetails.collateral}</p>
                  </>
                )}
              </div>
            </div>
            
            {borrower && Object.values(borrower).some(value => value !== undefined && value !== "") && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">BORROWER INFORMATION</h3>
                <div className="grid grid-cols-2 gap-2">
                  {borrower.name && (
                    <>
                      <p className="text-sm font-medium">Name:</p>
                      <p className="text-sm">{borrower.name}</p>
                    </>
                  )}
                  
                  {borrower.contactInfo && (
                    <>
                      <p className="text-sm font-medium">Contact:</p>
                      <p className="text-sm">{borrower.contactInfo}</p>
                    </>
                  )}
                  
                  {borrower.creditScore && (
                    <>
                      <p className="text-sm font-medium">Credit Score:</p>
                      <p className="text-sm">{borrower.creditScore}</p>
                    </>
                  )}
                  
                  {borrower.incomeVerification !== undefined && (
                    <>
                      <p className="text-sm font-medium">Income Verification:</p>
                      <p className="text-sm">{borrower.incomeVerification ? "Available" : "Not Available"}</p>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">TERMS</h3>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm font-medium">Payment Frequency:</p>
                <p className="text-sm capitalize">{terms.paymentFrequency}</p>
                
                {terms.earlyRepaymentPenalty !== undefined && (
                  <>
                    <p className="text-sm font-medium">Early Repayment Penalty:</p>
                    <p className="text-sm">{terms.earlyRepaymentPenalty}%</p>
                  </>
                )}
                
                {terms.lateFeePercentage !== undefined && (
                  <>
                    <p className="text-sm font-medium">Late Fee:</p>
                    <p className="text-sm">{terms.lateFeePercentage}%</p>
                  </>
                )}
                
                {terms.collateralRequirements && (
                  <>
                    <p className="text-sm font-medium">Collateral Requirements:</p>
                    <p className="text-sm">{terms.collateralRequirements}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI-Enhanced Analysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>AI Analysis</CardTitle>
            <Badge className={getRiskColor(enhanced.riskAssessment)}>
              {enhanced.riskAssessment}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">RISK ASSESSMENT</h3>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm font-medium">Risk Score:</p>
                <p className="text-sm">{enhanced.riskScore}/100</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">RECOMMENDATIONS</h3>
              <div className="space-y-4">
                {enhanced.recommendedInterestRate !== undefined && (
                  <div>
                    <p className="text-sm font-medium">Recommended Interest Rate:</p>
                    <p className="text-sm">{enhanced.recommendedInterestRate}%</p>
                    {enhanced.recommendedInterestRate > loanDetails.interestRate ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher than your proposed rate ({loanDetails.interestRate}%)
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        Lower than your proposed rate ({loanDetails.interestRate}%)
                      </p>
                    )}
                  </div>
                )}
                
                {enhanced.recommendedCollateral && (
                  <div>
                    <p className="text-sm font-medium">Collateral Recommendation:</p>
                    <p className="text-sm">{enhanced.recommendedCollateral}</p>
                  </div>
                )}
                
                {enhanced.marketComparison && (
                  <div>
                    <p className="text-sm font-medium">Market Comparison:</p>
                    <p className="text-sm">{enhanced.marketComparison}</p>
                  </div>
                )}
                
                {enhanced.additionalNotes && (
                  <div>
                    <p className="text-sm font-medium">Additional Notes:</p>
                    <p className="text-sm">{enhanced.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 