import { ContractService } from "./contract.service";
import { MetadataService } from "./metadata.service";

/**
 * Interface for complete loan metadata including IPFS and blockchain data
 */
export interface LoanMetadata {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  amount: number;
  interestRate: number;
  term: number;
  purpose?: string;
  collateral?: string;
  riskScore?: number;
  riskAssessment?: string;
  issuer?: string;
  timestamp?: number;
  status?: "Active" | "Repaid" | "Defaulted" | "Liquidated" | "Cancelled";
  dueDate?: number;
  metadataUri?: string;
  mintTransactionId?: string;
  mintBlockNumber?: number;
  schemaVersion?: string;
  tags?: string[];
}

/**
 * Service for fetching complete token details
 */
export class TokenDetailService {
  private contractService: ContractService;
  private metadataService: MetadataService;
  
  constructor() {
    this.contractService = new ContractService({
      chainId: 1287, // Moonbase Alpha
      loanRegistryAddress: import.meta.env.VITE_LOAN_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000"
    });
    this.metadataService = new MetadataService({
      ipfsGateway: "https://cloudflare-ipfs.com/ipfs/",
      contractService: this.contractService,
    });
  }
  
  /**
   * Get complete token data combining on-chain and IPFS metadata
   * @param tokenId Token ID to fetch data for
   * @returns Complete loan metadata or null if not found
   */
  async getTokenData(tokenId: string): Promise<LoanMetadata | null> {
    try {
      // Get on-chain data
      const onChainData = await this.contractService.getLoanMetadata(tokenId);
      
      if (!onChainData) {
        return null;
      }
      
      // Try to get IPFS metadata if available
      try {
        // Note: This is a placeholder - the actual implementation would need to 
        // fetch IPFS metadata based on tokenURI from the contract
        const ipfsMetadata = await this.fetchIpfsMetadata(tokenId);
        
        // Merge on-chain and IPFS data
        return {
          ...onChainData,
          ...ipfsMetadata,
          id: tokenId,
        } as LoanMetadata;
      } catch (ipfsError) {
        console.warn("Failed to load IPFS metadata, using on-chain only:", ipfsError);
        return {
          ...onChainData,
          id: tokenId,
        } as LoanMetadata;
      }
    } catch (error) {
      console.error("Error fetching token data:", error);
      
      // In development mode, return mock data
      if (import.meta.env.DEV) {
        return this.getMockTokenData(tokenId);
      }
      
      return null;
    }
  }

  /**
   * Fetch metadata from IPFS based on token ID
   * This is a placeholder method - would need to be implemented based on actual IPFS integration
   */
  private async fetchIpfsMetadata(tokenId: string): Promise<Partial<LoanMetadata>> {
    // In a real implementation, this would:
    // 1. Get the tokenURI from the contract
    // 2. Fetch the metadata from IPFS
    // 3. Parse the JSON data
    
    console.log(`Would fetch IPFS metadata for token ${tokenId}`);
    
    // For now, just return empty object since we're returning mock data in dev mode
    return {};
  }
  
  /**
   * Get mock token data for development
   * @param tokenId Token ID to generate mock data for
   * @returns Mock loan metadata
   */
  private getMockTokenData(tokenId: string): LoanMetadata {
    const riskOptions = ["Low Risk", "Medium Risk", "High Risk"];
    const riskAssessment = riskOptions[Math.floor(Math.random() * riskOptions.length)];
    const riskScore = riskAssessment === "Low Risk" 
      ? Math.floor(Math.random() * 30) + 10
      : riskAssessment === "Medium Risk"
        ? Math.floor(Math.random() * 30) + 40
        : Math.floor(Math.random() * 30) + 70;
    
    const amount = Math.floor(Math.random() * 10000) + 1000;
    const interestRate = Math.floor(Math.random() * 15) + 1;
    const term = Math.floor(Math.random() * 36) + 3;
    
    return {
      id: tokenId,
      name: `Loan Token #${tokenId}`,
      description: `A ${term}-month loan of $${amount.toLocaleString()} at ${interestRate}% interest rate`,
      image: "ipfs://bafkreihhxcbeaugnqkoxvhcgk4ri3snyavj3jbsgex7kfgwpthbar7v7mq",
      amount,
      interestRate,
      term,
      purpose: ["Business expansion", "Education", "Debt consolidation", "Home improvement"][Math.floor(Math.random() * 4)],
      collateral: ["Real estate", "Vehicle", "Securities", "None"][Math.floor(Math.random() * 4)],
      riskScore,
      riskAssessment,
      issuer: "0x1234567890123456789012345678901234567890",
      timestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      status: ["Active", "Repaid", "Defaulted"][Math.floor(Math.random() * 3)] as "Active" | "Repaid" | "Defaulted",
      dueDate: Date.now() + (term * 30 * 24 * 60 * 60 * 1000),
      metadataUri: `ipfs://bafkreih.../${tokenId}`,
      mintTransactionId: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      mintBlockNumber: 12345678,
      schemaVersion: "1.0.0",
      tags: ["defi", "loan", "moonbeam"],
    };
  }
} 