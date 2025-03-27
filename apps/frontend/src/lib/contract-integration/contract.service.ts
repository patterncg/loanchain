import { getPublicClient, getWalletClient } from "wagmi/actions";
import { LoanTokenABI } from "./abis/LoanToken.js";
import { EnhancedLoanData } from "@loanchain/storage";
import { parseEther } from "viem";

export interface ContractServiceConfig {
  loanRegistryAddress: string;
  chainId: number;
}

export interface MintTransactionResult {
  tokenId: string;
  transactionHash: string;
  blockNumber: number;
}

export class ContractService {
  private config: ContractServiceConfig;

  constructor(config: ContractServiceConfig) {
    this.config = config;
  }

  /**
   * Mint a loan token on the blockchain
   * @param address User wallet address
   * @param metadataURI IPFS URI of the metadata
   * @param loanData Enhanced loan data
   * @returns Transaction result including token ID and transaction hash
   */
  async mintLoanToken(
    address: string,
    metadataURI: string,
    loanData: EnhancedLoanData,
  ): Promise<MintTransactionResult> {
    try {
      // In development/testing environment, return a mock transaction result
      if (import.meta.env.DEV || import.meta.env.MODE === "development") {
        console.log("Development mode detected, mocking mint transaction");
        return {
          tokenId: Math.floor(Math.random() * 1000).toString(),
          transactionHash: `0x${Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("")}`,
          blockNumber: 12345678,
        };
      }

      // Get the wallet client for the connected user
      const walletClient = await getWalletClient({
        chainId: this.config.chainId,
      } as any);

      if (!walletClient) {
        throw new Error(
          "No wallet client available. Please connect your wallet.",
        );
      }

      // Prepare parameters for the mintLoanToken function
      const amount = parseEther(loanData.amount.toString());

      // Calculate due date based on term (months from now)
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const secondsInMonth = 30 * 24 * 60 * 60; // Approximate seconds in a month
      const dueDate = now + loanData.term * secondsInMonth;

      // Use the loan terms document URL if available, or create a placeholder
      const loanTermsHash =
        (loanData as any).loanTermsDocumentUrl || "ipfs://no-terms-document";

      // Call the smart contract to mint the loan token
      const hash = await walletClient.writeContract({
        address: this.config.loanRegistryAddress as `0x${string}`,
        abi: LoanTokenABI,
        functionName: "mintLoanToken",
        args: [
          address as `0x${string}`,
          metadataURI,
          amount,
          BigInt(dueDate),
          loanTermsHash,
        ],
        // Add chain property to fix TypeScript error
        chain: null,
      } as any);

      // Wait for the transaction to be mined
      const publicClient = getPublicClient({
        chainId: this.config.chainId,
      } as any);

      if (!publicClient) {
        throw new Error("No public client available");
      }

      // Wait for the transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      // Extract token ID (in a real implementation we would parse this from logs)
      const tokenId = Date.now().toString(); // Mock token ID as fallback

      return {
        tokenId,
        transactionHash: hash,
        blockNumber: Number(receipt.blockNumber),
      };
    } catch (error) {
      console.error("Error minting loan token:", error);
      throw new Error(
        `Failed to mint loan token: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get loan metadata from the blockchain
   * @param tokenId Token ID
   * @returns Loan metadata from the blockchain
   */
  async getLoanMetadata(tokenId: string) {
    try {
      // In development mode, return mock metadata
      if (import.meta.env.DEV || import.meta.env.MODE === "development") {
        return {
          id: tokenId,
          amount: 1000,
          interestRate: 5,
          term: 12,
          issuer: "0x1234567890123456789012345678901234567890",
          timestamp: Date.now(),
        };
      }

      const publicClient = getPublicClient({
        chainId: this.config.chainId,
      } as any);

      // Verify that publicClient exists and has the readContract method
      if (!publicClient || typeof publicClient.readContract !== "function") {
        console.warn(
          "Public client not available or missing readContract method",
        );
        return null;
      }

      const result = await publicClient.readContract({
        address: this.config.loanRegistryAddress as `0x${string}`,
        abi: LoanTokenABI,
        functionName: "getLoanMetadata",
        args: [BigInt(tokenId)],
      });

      return result;
    } catch (error) {
      console.error("Error getting loan metadata:", error);
      return null;
    }
  }

  /**
   * Check if the current user has the MINTER_ROLE
   * @param address User wallet address
   * @returns True if the user has the MINTER_ROLE
   */
  async hasMinterRole(address: string): Promise<boolean> {
    try {
      // In development/testing environment, always return true if wallet is connected
      if (import.meta.env.DEV || import.meta.env.MODE === "development") {
        console.log(
          "Development mode detected, mocking minter role check to return true",
        );
        return true;
      }

      const publicClient = getPublicClient({
        chainId: this.config.chainId,
      } as any);

      // Verify that publicClient exists and has the readContract method
      if (!publicClient || typeof publicClient.readContract !== "function") {
        console.warn(
          "Public client not available or missing readContract method, defaulting to false",
        );
        return false;
      }

      // Get the MINTER_ROLE bytes32 value
      const minterRole = await publicClient.readContract({
        address: this.config.loanRegistryAddress as `0x${string}`,
        abi: LoanTokenABI,
        functionName: "MINTER_ROLE",
        args: [],
      });

      // Check if the user has the role
      const hasRole = await publicClient.readContract({
        address: this.config.loanRegistryAddress as `0x${string}`,
        abi: LoanTokenABI,
        functionName: "hasRole",
        args: [minterRole, address as `0x${string}`],
      });

      return hasRole as boolean;
    } catch (error) {
      console.error("Error checking minter role:", error);
      // In development mode, still allow minting for testing
      if (import.meta.env.DEV || import.meta.env.MODE === "development") {
        console.warn("Development mode: allowing minting despite error");
        return true;
      }
      return false;
    }
  }

  /**
   * Get active loans from the contract
   * @returns Array of token IDs for active loans
   */
  async getActiveLoans(): Promise<string[]> {
    try {
      // In development mode, return mock data
      if (import.meta.env.DEV || import.meta.env.MODE === "development") {
        return ["1", "2", "3"]; // Mock token IDs for testing
      }

      const publicClient = getPublicClient({
        chainId: this.config.chainId,
      } as any);

      // Verify that publicClient exists and has the readContract method
      if (!publicClient || typeof publicClient.readContract !== "function") {
        console.warn(
          "Public client not available or missing readContract method, returning empty array",
        );
        return [];
      }

      const result = await publicClient.readContract({
        address: this.config.loanRegistryAddress as `0x${string}`,
        abi: LoanTokenABI,
        functionName: "getActiveLoans",
        args: [],
      });

      return (result as bigint[]).map((id) => id.toString());
    } catch (error) {
      console.error("Error getting active loans:", error);
      return []; // Return empty array instead of throwing to avoid cascading errors
    }
  }

  /**
   * Get all loans owned by an address
   * @param owner Owner address
   * @returns Array of token IDs owned by the address
   */
  async getLoansByOwner(owner: string): Promise<string[]> {
    try {
      // In development mode, return mock data
      if (import.meta.env.DEV || import.meta.env.MODE === "development") {
        return ["1", "2"]; // Mock token IDs for testing
      }

      const publicClient = getPublicClient({
        chainId: this.config.chainId,
      } as any);

      // Verify that publicClient exists and has the readContract method
      if (!publicClient || typeof publicClient.readContract !== "function") {
        console.warn(
          "Public client not available or missing readContract method, returning empty array",
        );
        return [];
      }

      const result = await publicClient.readContract({
        address: this.config.loanRegistryAddress as `0x${string}`,
        abi: LoanTokenABI,
        functionName: "getLoanTokensByOwner",
        args: [owner as `0x${string}`],
      });

      return (result as bigint[]).map((id) => id.toString());
    } catch (error) {
      console.error("Error getting loans by owner:", error);
      return []; // Return empty array instead of throwing to avoid cascading errors
    }
  }
}
