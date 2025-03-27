import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ContractService, MintTransactionResult } from "../contract.service";
import { MetadataService } from "../metadata.service";
import { ChainId } from "../config";

// Mock wagmi functions
vi.mock("wagmi/actions", () => ({
  getPublicClient: vi.fn().mockImplementation(() => ({
    getContract: vi.fn().mockReturnValue({
      interface: {
        parseLog: vi.fn().mockReturnValue({
          name: "LoanTokenMinted",
          args: { tokenId: BigInt(123) },
        }),
      },
    }),
    readContract: vi.fn().mockImplementation(async ({ functionName }) => {
      if (functionName === "MINTER_ROLE") {
        return "0x0000000000000000000000000000000000000000000000000000000000000000";
      }
      if (functionName === "hasRole") {
        return true;
      }
      if (functionName === "getActiveLoans") {
        return [BigInt(123), BigInt(456)];
      }
      if (functionName === "getLoanTokensByOwner") {
        return [BigInt(123)];
      }
      return undefined;
    }),
    waitForTransactionReceipt: vi.fn().mockResolvedValue({
      logs: [{ topics: ["0x123"] }],
      blockNumber: BigInt(100),
    }),
  })),
  getWalletClient: vi.fn().mockResolvedValue({
    writeContract: vi.fn().mockResolvedValue("0x123456789abcdef"),
  }),
}));

// Mock viem functions
vi.mock("viem", () => ({
  parseEther: vi
    .fn()
    .mockImplementation((value) => BigInt(Number(value) * 10 ** 18)),
}));

// Mock IPFSService
vi.mock("@loanchain/storage", () => ({
  IPFSService: vi.fn().mockImplementation(() => ({
    uploadJSON: vi.fn().mockResolvedValue({
      uri: "ipfs://Qm123456789",
      cid: "Qm123456789",
    }),
  })),
}));

describe("ContractService", () => {
  let contractService: ContractService;

  beforeEach(() => {
    contractService = new ContractService({
      loanRegistryAddress: "0x1234567890123456789012345678901234567890",
      chainId: ChainId.MOONBASE_ALPHA,
    });

    // Clear any mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("mintLoanToken", () => {
    it("should mint a loan token successfully", async () => {
      const result = await contractService.mintLoanToken(
        "0xabc",
        "ipfs://Qm123456789",
        {
          amount: 1000,
          term: 12,
          purpose: "Test Loan",
          interestRate: 5.5,
          borrowerType: "individual",
          income: 5000,
          expenses: 2000,
          creditScore: 700,
        },
      );

      expect(result).toMatchObject({
        tokenId: "123",
        transactionHash: "0x123456789abcdef",
        blockNumber: 100,
      });
    });
  });

  describe("hasMinterRole", () => {
    it("should check if user has minter role", async () => {
      const result = await contractService.hasMinterRole("0xabc");
      expect(result).toBe(true);
    });
  });

  describe("getActiveLoans", () => {
    it("should get active loans", async () => {
      const result = await contractService.getActiveLoans();
      expect(result).toEqual(["123", "456"]);
    });
  });

  describe("getLoansByOwner", () => {
    it("should get loans by owner", async () => {
      const result = await contractService.getLoansByOwner("0xabc");
      expect(result).toEqual(["123"]);
    });
  });
});

describe("MetadataService", () => {
  let metadataService: MetadataService;
  let mockContractService: ContractService;

  beforeEach(() => {
    mockContractService = new ContractService({
      loanRegistryAddress: "0x1234567890123456789012345678901234567890",
      chainId: ChainId.MOONBASE_ALPHA,
    });

    // Mock the mintLoanToken method to return a predetermined result
    vi.spyOn(mockContractService, "mintLoanToken").mockResolvedValue({
      tokenId: "456",
      transactionHash: "0xabcdef123456",
      blockNumber: 200,
    } as MintTransactionResult);

    // Mock the hasMinterRole method to return true
    vi.spyOn(mockContractService, "hasMinterRole").mockResolvedValue(true);

    metadataService = new MetadataService({
      ipfsGateway: "https://gateway.pinata.cloud",
      contractService: mockContractService,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("uploadAndMint", () => {
    it("should upload metadata and mint token", async () => {
      const result = await metadataService.uploadAndMint("0xabc", {
        amount: 2000,
        term: 24,
        purpose: "Business Expansion",
        interestRate: 7.5,
        borrowerType: "business",
        income: 10000,
        expenses: 5000,
        creditScore: 800,
        aiEnhanced: {
          riskScore: "Low",
          riskFactors: ["Good credit history"],
          recommendations: ["Approve loan"],
        },
      });

      expect(result).toMatchObject({
        tokenId: "456",
        transactionHash: "0xabcdef123456",
        blockNumber: 200,
        metadataUri: "ipfs://Qm123456789",
      });

      // Verify that the mintLoanToken method was called
      expect(mockContractService.mintLoanToken).toHaveBeenCalledTimes(1);
    });
  });
});
