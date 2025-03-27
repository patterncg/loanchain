import { describe, it, expect, vi, beforeEach } from "vitest";
import { IPFSService } from "./ipfs.service";
import { EnhancedLoanData } from "./types";

// Mock NFTStorage
vi.mock("nft.storage", () => {
  return {
    NFTStorage: vi.fn().mockImplementation(() => {
      return {
        store: vi.fn().mockResolvedValue({
          url: "ipfs://test-cid/metadata.json",
          ipnft: "test-cid",
        }),
        storeBlob: vi.fn().mockResolvedValue("test-cid"),
        status: vi.fn().mockResolvedValue({ ok: true }),
      };
    }),
    File: vi.fn().mockImplementation((data, name, options) => {
      return { data, name, options };
    }),
    Blob: vi.fn().mockImplementation((data, options) => {
      return { data, options, size: 123 };
    }),
  };
});

// Mock file-type
vi.mock("file-type", () => {
  return {
    fileTypeFromBuffer: vi.fn().mockResolvedValue({ mime: "image/jpeg" }),
  };
});

// Mock mime
vi.mock("mime", () => {
  return {
    getExtension: vi.fn().mockReturnValue("jpg"),
  };
});

describe("IPFSService", () => {
  let ipfsService: IPFSService;
  const mockConfig = { token: "test-token" };

  beforeEach(() => {
    ipfsService = new IPFSService(mockConfig);
  });

  describe("uploadMetadata", () => {
    it("should upload metadata and return IPFS response", async () => {
      const loanData: EnhancedLoanData = {
        amount: 1000,
        interestRate: 5,
        term: 12,
        collateralType: "Real Estate",
        collateralValue: 50000,
        purpose: "Home Renovation",
      };

      const result = await ipfsService.uploadMetadata(loanData);

      expect(result).toEqual({
        url: "ipfs://test-cid/metadata.json",
        cid: "test-cid",
        size: 0,
      });
    });
  });

  describe("uploadFile", () => {
    it("should upload a file and return IPFS response", async () => {
      const fileData = Buffer.from("test file data");
      const options = { fileName: "test.jpg", contentType: "image/jpeg" };

      const result = await ipfsService.uploadFile(fileData, options);

      expect(result).toEqual({
        url: "ipfs://test-cid",
        cid: "test-cid",
        size: fileData.length,
      });
    });

    it("should detect file type if not provided", async () => {
      const fileData = Buffer.from("test file data");

      const result = await ipfsService.uploadFile(fileData);

      expect(result).toEqual({
        url: "ipfs://test-cid",
        cid: "test-cid",
        size: fileData.length,
      });
    });
  });

  describe("uploadJSON", () => {
    it("should upload JSON data and return IPFS response", async () => {
      const jsonData = { test: "data" };

      const result = await ipfsService.uploadJSON(jsonData);

      expect(result).toEqual({
        url: "ipfs://test-cid",
        cid: "test-cid",
        size: 123,
      });
    });
  });

  describe("checkStatus", () => {
    it("should return true if service is operational", async () => {
      const result = await ipfsService.checkStatus();

      expect(result).toBe(true);
    });

    it("should return false if service check throws an error", async () => {
      // Mock implementation that throws an error
      vi.mocked(ipfsService["client"].status).mockRejectedValueOnce(
        new Error("Service unavailable"),
      );

      const result = await ipfsService.checkStatus();

      expect(result).toBe(false);
    });
  });
});
