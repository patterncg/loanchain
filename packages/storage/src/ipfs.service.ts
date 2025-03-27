import { NFTStorage, File, Blob } from "nft.storage";
import mime from "mime";
import { fileTypeFromBuffer } from "file-type";
import {
  EnhancedLoanData,
  IPFSUploadResponse,
  IPFSServiceConfig,
  FileUploadOptions,
} from "./types.js";

/**
 * Service for uploading files and metadata to IPFS using nft.storage
 */
export class IPFSService {
  private client: NFTStorage;
  private defaultImagePath: string;

  /**
   * Creates a new instance of the IPFS service
   * @param config Configuration for the IPFS service
   */
  constructor(config: IPFSServiceConfig) {
    this.client = new NFTStorage({ token: config.token });
    this.defaultImagePath =
      config.defaultImagePath ||
      "ipfs://bafkreihhxcbeaugnqkoxvhcgk4ri3snyavj3jbsgex7kfgwpthbar7v7mq"; // Default loan token image
  }

  /**
   * Uploads loan metadata to IPFS
   * @param data Enhanced loan data to be stored
   * @returns IPFS upload response including the URL and CID
   */
  async uploadMetadata(data: EnhancedLoanData): Promise<IPFSUploadResponse> {
    try {
      const timestamp = data.timestamp || Date.now();
      const id = data.id || `loan-${timestamp}`;

      // Create a placeholder File object for the image URL
      const imageFile = await this.getImageFileFromUrl(this.defaultImagePath);

      const metadata = await this.client.store({
        name: `Loan Token #${id}`,
        description:
          data.aiSummary || `Loan for ${data.purpose || "general purposes"}.`,
        image: imageFile,
        properties: {
          ...data,
          timestamp,
        },
      });

      return {
        url: metadata.url,
        cid: metadata.ipnft,
        size: 0, // Size information not directly available from nft.storage store method
      };
    } catch (error) {
      console.error("Error uploading metadata to IPFS:", error);
      throw new Error(
        `Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Helper to get a File object from an IPFS URL or use a placeholder
   * @param url IPFS URL or regular URL
   * @returns File object for NFT.Storage
   */
  private async getImageFileFromUrl(url: string): Promise<File> {
    // For simplicity, just create a placeholder file with minimal content
    // In a production app, you would fetch the actual image data
    return new File([new Uint8Array([1, 2, 3, 4])], "placeholder.png", {
      type: "image/png",
    });
  }

  /**
   * Uploads a file to IPFS
   * @param fileData File data as Buffer or Uint8Array
   * @param options File upload options
   * @returns IPFS upload response including the URL and CID
   */
  async uploadFile(
    fileData: Buffer | Uint8Array,
    options?: FileUploadOptions,
  ): Promise<IPFSUploadResponse> {
    try {
      let fileName = options?.fileName;
      let contentType = options?.contentType;

      // Try to detect file type if not provided
      if (!contentType) {
        const fileType = await fileTypeFromBuffer(fileData);
        contentType = fileType?.mime || "application/octet-stream";
      }

      // Generate a filename if not provided
      if (!fileName) {
        const extension = mime.getExtension(contentType) || "bin";
        fileName = `file-${Date.now()}.${extension}`;
      }

      // Create a File object
      const file = new File([fileData], fileName, { type: contentType });

      // Upload to IPFS
      const cid = await this.client.storeBlob(file);

      return {
        url: `ipfs://${cid}`,
        cid,
        size: fileData.length,
      };
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      throw new Error(
        `Failed to upload file to IPFS: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Uploads a JSON object to IPFS
   * @param jsonData Object to be serialized and uploaded
   * @returns IPFS upload response including the URL and CID
   */
  async uploadJSON(jsonData: Record<string, any>): Promise<IPFSUploadResponse> {
    try {
      const blob = new Blob([JSON.stringify(jsonData)], {
        type: "application/json",
      });
      const cid = await this.client.storeBlob(blob);

      return {
        url: `ipfs://${cid}`,
        cid,
        size: blob.size,
      };
    } catch (error) {
      console.error("Error uploading JSON to IPFS:", error);
      throw new Error(
        `Failed to upload JSON to IPFS: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Checks if the IPFS service is operational by performing a simple status check
   * @returns True if the service is operational, false otherwise
   */
  async checkStatus(): Promise<boolean> {
    try {
      // Use a simple request to the NFT.Storage service to check if it's available
      // Instead of using the problematic status method
      const testBlob = new Blob([JSON.stringify({ test: true })], {
        type: "application/json",
      });
      const cid = await this.client.storeBlob(testBlob);

      return !!cid && typeof cid === "string" && cid.length > 0;
    } catch (error) {
      console.error("Error checking IPFS service status:", error);
      return false;
    }
  }
}
