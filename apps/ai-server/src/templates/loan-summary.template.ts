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
 * Creates a prompt for generating a human-readable loan summary
 * @param loanData The loan data to summarize
 * @returns A prompt to send to the LLM
 */
export function getLoanSummary(loanData: LoanData): string {
  const {
    borrowerName,
    loanAmount,
    interestRate,
    loanTerm,
    collateralType,
    collateralValue,
    purpose,
  } = loanData;

  // Format monetary values
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(loanAmount);

  // Format interest rate
  const formattedRate = `${interestRate}%`;

  // Create a collateral description if provided
  const collateralDescription =
    collateralType && collateralValue
      ? `This loan is secured by ${collateralType} valued at ${new Intl.NumberFormat(
          "en-US",
          {
            style: "currency",
            currency: "USD",
          },
        ).format(collateralValue)}.`
      : "This is an unsecured loan.";

  // Create a purpose description if provided
  const purposeDescription = purpose
    ? `The purpose of this loan is for: ${purpose}.`
    : "";

  // Build the prompt
  return `
Please generate a concise, human-readable summary of the following loan details:

LOAN DETAILS:
- Borrower: ${borrowerName}
- Loan Amount: ${formattedAmount}
- Interest Rate: ${formattedRate}
- Loan Term: ${loanTerm} months
- ${collateralDescription}
- ${purposeDescription}

Your summary should be professional, clear, and highlight the key terms of the loan in a way that would be helpful for both the lender and borrower. Keep the summary to 2-3 sentences maximum.
`;
}
