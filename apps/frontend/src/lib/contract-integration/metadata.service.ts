import { EnhancedLoanData, MetadataServiceConfig } from './types';
import { ContractService, MintTransactionResult } from './contract.service';

/**
 * Result of a mint operation including metadata URI
 */
export interface MintResult extends MintTransactionResult {
  metadataUri: string;
}

/**
 * Service for handling metadata operations and interacting with the blockchain
 */
export class MetadataService {
  private ipfsGateway: string;
  private contractService: ContractService;
  private pinataApiKey?: string;
  private pinataSecretKey?: string;

  /**
   * Creates a new metadata service
   * @param config Configuration for the metadata service
   */
  constructor(config: MetadataServiceConfig) {
    this.ipfsGateway = config.ipfsGateway;
    this.contractService = config.contractService as ContractService;
    this.pinataApiKey = config.pinataApiKey;
    this.pinataSecretKey = config.pinataSecretKey;
  }

  /**
   * Upload metadata to IPFS and mint a token in one operation
   * @param walletAddress User wallet address
   * @param loanData Enhanced loan data
   * @returns Result of the mint operation
   */
  async uploadAndMint(walletAddress: string, loanData: EnhancedLoanData): Promise<MintResult> {
    try {
      // Generate a placeholder metadata URI for now
      // In a real implementation, this would upload to IPFS first
      const metadataUri = `ipfs://placeholder/${Date.now()}`;
      
      // Mint the token using the contract service
      const mintResult = await this.contractService.mintLoanToken(
        walletAddress,
        metadataUri,
        loanData
      );
      
      return {
        ...mintResult,
        metadataUri
      };
    } catch (error) {
      console.error('Error in uploadAndMint:', error);
      throw new Error(`Failed to upload and mint: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Estimate the gas fee for minting a token
   * @param walletAddress User wallet address
   * @returns Estimated gas fee in ETH
   */
  async estimateGasFee(walletAddress: string): Promise<number> {
    // This is just a placeholder implementation
    // In a real implementation, this would call a gas estimator
    return 0.001; // A fixed estimate for demonstration
  }

  /**
   * Get loans owned by the user
   * @param walletAddress User wallet address
   * @returns Array of token IDs
   */
  async getUserLoans(walletAddress: string): Promise<string[]> {
    return this.contractService.getLoansByOwner(walletAddress);
  }

  /**
   * Get all active loans
   * @returns Array of token IDs
   */
  async getActiveLoans(): Promise<string[]> {
    return this.contractService.getActiveLoans();
  }
} 