/**
 * Represents the enhanced loan data for metadata creation.
 */
export interface EnhancedLoanData {
  id?: string | number;
  amount: number;
  interestRate: number;
  term: number;
  collateralType: string;
  collateralValue: number;
  purpose: string;
  borrowerDetails?: {
    name?: string;
    creditScore?: number;
  };
  aiSummary?: string;
  riskTag?: string;
  issuer?: string;
  timestamp?: number;
  loanTermsDocumentUrl?: string;
}

/**
 * Configuration for the metadata service.
 */
export interface MetadataServiceConfig {
  ipfsGateway: string;
  pinataApiKey?: string;
  pinataSecretKey?: string;
  contractService: any;
} 