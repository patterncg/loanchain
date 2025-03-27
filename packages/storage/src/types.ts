/**
 * Represents the simplified loan data for metadata creation.
 */
export interface EnhancedLoanData {
  id?: string | number;
  amount: number;
  interestRate: number;
  term: number;
  issuer?: string;
  timestamp?: number;

  // Optional fields that may be used in some cases but aren't required
  purpose?: string;
  collateralType?: string;
  collateralValue?: number;
  borrowerDetails?: {
    name?: string;
    creditScore?: number;
  };
  aiSummary?: string;
  riskTag?: string;
}

/**
 * IPFS upload response structure.
 */
export interface IPFSUploadResponse {
  url: string;
  cid: string;
  size: number;
}

/**
 * Configuration for IPFS service.
 */
export interface IPFSServiceConfig {
  token: string;
  defaultImagePath?: string;
}

/**
 * File upload options.
 */
export interface FileUploadOptions {
  fileName?: string;
  contentType?: string;
}
