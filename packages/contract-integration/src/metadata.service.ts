import { IPFSService } from '@loanchain/storage';
import { EnhancedLoanData } from '@loanchain/storage';
import { ContractService, MintTransactionResult } from './contract.service.js';

export interface MetadataServiceConfig {
  ipfsGateway: string;
  pinataApiKey?: string;
  pinataSecretKey?: string;
  contractService: ContractService;
}

export interface MintResult extends MintTransactionResult {
  metadataUri: string;
}

// Extended Enhanced Loan Data with additional fields needed by this service
export interface ExtendedLoanData extends EnhancedLoanData {
  loanTermsDocumentUrl?: string;
  borrowerType?: string;
  income?: number;
  expenses?: number;
  creditScore?: number;
  collateral?: string;
  aiEnhanced?: {
    riskScore?: string | number;
    riskFactors?: string[];
    recommendations?: string[];
  };
}

/**
 * Service for managing loan metadata, combining IPFS storage with contract integration
 */
export class MetadataService {
  private ipfsService: IPFSService;
  private contractService: ContractService;

  constructor(config: MetadataServiceConfig) {
    // Create a compatible config for IPFSService
    this.ipfsService = new IPFSService({
      token: 'dummy-token', // Will be replaced with actual token in a real implementation
      defaultImagePath: 'ipfs://QmUyLztKNVhGGpKvTx6jDKHUm6hxJE3iLzB7kte1So3VBJ'
    });
    this.contractService = config.contractService;
  }

  /**
   * Upload loan metadata to IPFS and mint a loan token
   * @param walletAddress User wallet address
   * @param loanData Enhanced loan data
   * @returns Minting result with token ID, transaction hash, and metadata URI
   */
  async uploadAndMint(walletAddress: string, loanData: ExtendedLoanData): Promise<MintResult> {
    try {
      // First, check if the user has the minter role
      const hasMinterRole = await this.contractService.hasMinterRole(walletAddress);
      
      if (!hasMinterRole) {
        throw new Error("You don't have permission to mint loan tokens. Please contact the administrator.");
      }

      // Step 1: Create and upload the metadata to IPFS
      const metadata = this.constructMetadata(loanData);
      const ipfsResult = await this.ipfsService.uploadJSON(metadata);
      
      if (!ipfsResult.url) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      // Step 2: Mint the token with the metadata URI
      const mintResult = await this.contractService.mintLoanToken(
        walletAddress,
        ipfsResult.url,
        loanData
      );

      return {
        ...mintResult,
        metadataUri: ipfsResult.url
      };
    } catch (error) {
      console.error('Error in uploadAndMint:', error);
      throw new Error(`Failed to upload and mint: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Construct metadata object from loan data
   * @param loanData Enhanced loan data
   * @returns Metadata object for IPFS
   */
  private constructMetadata(loanData: ExtendedLoanData): Record<string, any> {
    const currentDate = new Date().toISOString();
    
    return {
      name: `Loan Token: ${loanData.purpose}`,
      description: `Loan request for ${loanData.amount} with ${loanData.term} month term. Purpose: ${loanData.purpose}`,
      created_at: currentDate,
      image: "ipfs://QmUyLztKNVhGGpKvTx6jDKHUm6hxJE3iLzB7kte1So3VBJ", // Default loan image
      animation_url: "",
      external_url: "",
      attributes: [
        {
          trait_type: "Amount",
          value: loanData.amount
        },
        {
          trait_type: "Term",
          value: loanData.term
        },
        {
          trait_type: "Purpose",
          value: loanData.purpose
        },
        {
          trait_type: "Interest Rate",
          value: loanData.interestRate
        },
        {
          trait_type: "Risk Score",
          value: loanData.aiEnhanced?.riskScore || "Unknown"
        },
        {
          trait_type: "Borrower Type",
          value: loanData.borrowerType || "Unknown"
        },
        {
          display_type: "date", 
          trait_type: "Created Date", 
          value: Math.floor(Date.now() / 1000)
        }
      ],
      properties: {
        loan_details: {
          amount: loanData.amount,
          term: loanData.term,
          purpose: loanData.purpose,
          interest_rate: loanData.interestRate,
          borrower_type: loanData.borrowerType || "Unknown",
          collateral: loanData.collateral || "None"
        },
        borrower_info: {
          income: loanData.income || 0,
          expenses: loanData.expenses || 0,
          credit_score: loanData.creditScore || 0
        },
        ai_assessment: loanData.aiEnhanced ? {
          risk_score: loanData.aiEnhanced.riskScore || "Unknown",
          risk_factors: loanData.aiEnhanced.riskFactors || [],
          recommendations: loanData.aiEnhanced.recommendations || []
        } : null
      }
    };
  }

  /**
   * Estimate gas fee for minting a loan token
   * @param walletAddress User wallet address
   * @returns Estimated gas fee in native token
   */
  async estimateGasFee(walletAddress: string): Promise<number> {
    // This would be implemented with actual gas estimation from blockchain
    // For now, returning a mock estimate
    return 0.002; // Mock gas fee in native token (e.g., DEV for Moonbase Alpha)
  }

  /**
   * Get loan tokens owned by the user
   * @param walletAddress User wallet address
   * @returns Array of token IDs
   */
  async getUserLoans(walletAddress: string): Promise<string[]> {
    return this.contractService.getLoansByOwner(walletAddress);
  }
  
  /**
   * Get active loans from the contract
   * @returns Array of token IDs
   */
  async getActiveLoans(): Promise<string[]> {
    return this.contractService.getActiveLoans();
  }
} 