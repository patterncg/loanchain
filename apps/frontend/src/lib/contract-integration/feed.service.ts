import { ContractService } from "./contract.service";

/**
 * Interface for the loan summary data shown in the feed
 */
export interface LoanSummary {
  id: string;
  amount: number;
  interestRate: number;
  term: number;
  riskAssessment?: string;
  riskScore?: number;
  issuer?: string;
  timestamp?: number;
}

/**
 * Service for fetching feed data
 */
export class FeedService {
  private contractService: ContractService;
  
  constructor() {
    this.contractService = new ContractService({
      chainId: 1287, // Moonbase Alpha
      loanRegistryAddress: import.meta.env.VITE_LOAN_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000"
    });
  }
  
  /**
   * Get paginated loans with basic info
   * @param page Current page number (1-based)
   * @param pageSize Number of items per page
   * @returns Array of loan summaries
   */
  async getPaginatedLoans(page: number = 1, pageSize: number = 10): Promise<LoanSummary[]> {
    try {
      // Get all active loan IDs
      const loanIds = await this.contractService.getActiveLoans();
      
      // Get the slice for current page
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedIds = loanIds.slice(startIndex, endIndex);
      
      // Fetch basic data for each loan
      const loansData = await Promise.all(
        paginatedIds.map(id => this.contractService.getLoanMetadata(id))
      );
      
      return loansData as LoanSummary[];
    } catch (error) {
      console.error("Error fetching paginated loans:", error);
      
      // In development mode, return mock data
      if (import.meta.env.DEV) {
        return this.getMockLoans(page, pageSize);
      }
      
      throw error;
    }
  }
  
  /**
   * Get mock loans for development
   * @param page Current page number
   * @param pageSize Number of items per page
   * @returns Array of mock loan summaries
   */
  private getMockLoans(page: number, pageSize: number): LoanSummary[] {
    // Generate mock data based on page and pageSize
    return Array(pageSize).fill(0).map((_, i) => ({
      id: `${(page - 1) * pageSize + i + 1}`,
      amount: Math.floor(Math.random() * 10000) + 1000,
      interestRate: Math.floor(Math.random() * 15) + 1,
      term: Math.floor(Math.random() * 36) + 3,
      riskAssessment: ["Low Risk", "Medium Risk", "High Risk"][Math.floor(Math.random() * 3)],
      riskScore: Math.floor(Math.random() * 100),
      issuer: "0x1234567890123456789012345678901234567890",
      timestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
    }));
  }
} 