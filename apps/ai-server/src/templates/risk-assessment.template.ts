interface LoanData {
  borrowerName: string;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  collateralType?: string;
  collateralValue?: number;
  borrowerCreditScore?: number;
  purpose?: string;
  [key: string]: any;
}

/**
 * Creates a prompt for generating a risk assessment for a loan
 * @param loanData The loan data to assess
 * @returns A prompt to send to the LLM
 */
export function getRiskAssessment(loanData: LoanData): string {
  const {
    loanAmount,
    interestRate,
    loanTerm,
    collateralType,
    collateralValue,
    borrowerCreditScore,
    purpose,
  } = loanData;

  // Calculate loan-to-value ratio if collateral exists
  const ltvRatio =
    collateralType && collateralValue
      ? (loanAmount / collateralValue) * 100
      : null;

  const ltvDescription = ltvRatio
    ? `Loan-to-Value Ratio: ${ltvRatio.toFixed(2)}%`
    : "No collateral (unsecured loan)";

  // Create credit score description if provided
  const creditDescription = borrowerCreditScore
    ? `Borrower Credit Score: ${borrowerCreditScore}`
    : "Credit score not provided";

  // Build the prompt
  return `
Please analyze the following loan details and provide a concise risk assessment with appropriate tags (Low Risk, Medium Risk, High Risk):

LOAN DETAILS:
- Loan Amount: $${loanAmount}
- Interest Rate: ${interestRate}%
- Loan Term: ${loanTerm} months
- ${ltvDescription}
- ${creditDescription}
- Purpose: ${purpose || "Not specified"}

Your response should include:
1. An overall risk rating (Low, Medium, or High)
2. 3-5 risk factors identified from the loan details
3. 1-2 recommendations for risk mitigation

Format your response as JSON with the following structure:
{
  "riskRating": "Low/Medium/High",
  "riskFactors": ["factor1", "factor2", "factor3"],
  "recommendations": ["recommendation1", "recommendation2"]
}
`;
}
