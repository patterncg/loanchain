/**
 * Formats a unix timestamp as an ISO date string
 * @param timestamp Unix timestamp to format
 * @returns ISO date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Formats a wallet address as a shortened string
 * @param address Wallet address to format
 * @returns Shortened address string
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Formats an amount with a currency symbol
 * @param amount Amount to format
 * @param currency Currency symbol
 * @returns Formatted amount string
 */
export function formatAmount(amount: number, currency: string = '$'): string {
  return `${currency}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Formats an interest rate as a percentage
 * @param rate Interest rate to format
 * @returns Formatted percentage string
 */
export function formatInterestRate(rate: number): string {
  return `${rate.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
}

/**
 * Formats a term in months with proper pluralization
 * @param term Term in months
 * @returns Formatted term string
 */
export function formatTerm(term: number): string {
  return term === 1 ? '1 month' : `${term} months`;
}

/**
 * Sanitizes input for IPFS metadata to prevent injection attacks
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove HTML tags and limit length
  return input
    .replace(/<[^>]*>/g, '')
    .trim()
    .substring(0, 1000);
}

/**
 * Converts a hex string to a buffer
 * @param hex Hex string to convert
 * @returns Buffer
 */
export function hexToBuffer(hex: string): Buffer {
  if (hex.startsWith('0x')) {
    hex = hex.substring(2);
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Creates a summary from loan data
 * @param purpose Loan purpose
 * @param amount Loan amount
 * @param term Loan term in months
 * @returns Summary string
 */
export function createLoanSummary(
  purpose: string,
  amount: number,
  term: number
): string {
  const formattedAmount = formatAmount(amount);
  const formattedTerm = formatTerm(term);
  
  return `${formattedAmount} loan for ${purpose || 'general purposes'} over ${formattedTerm}.`;
}

/**
 * Simple risk assessment based on loan data
 * @param loanAmount Loan amount
 * @param collateralValue Collateral value
 * @param term Loan term
 * @param creditScore Credit score if available
 * @returns Risk tag string
 */
export function assessRisk(
  loanAmount: number,
  collateralValue: number,
  term: number,
  creditScore?: number
): string {
  // Calculate loan-to-value ratio
  const ltv = loanAmount / collateralValue;
  
  // Base risk on LTV
  if (ltv < 0.5) {
    return creditScore && creditScore > 720 ? 'Very Low Risk' : 'Low Risk';
  } else if (ltv < 0.7) {
    return creditScore && creditScore > 680 ? 'Low Risk' : 'Medium Risk';
  } else if (ltv < 0.85) {
    return creditScore && creditScore > 720 ? 'Medium Risk' : 'High Risk';
  } else {
    return 'Very High Risk';
  }
} 