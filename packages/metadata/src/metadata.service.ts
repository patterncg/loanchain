import Ajv from "ajv";
import addFormats from "ajv-formats";
import { v4 as uuidv4 } from "uuid";
import { EnhancedLoanData } from "@loanchain/storage";
import {
  LoanMetadata,
  NFTMetadata,
  NFTAttribute,
  MetadataServiceConfig,
  CreateMetadataOptions,
  ValidationResult,
  LoanStatus,
} from "./types.js";
import { nftMetadataSchema, loanMetadataSchema } from "./schemas/zod.schema.js";
// Import the JSON schema directly instead of using import syntax for JSON
const metadataSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "NFT Metadata",
  type: "object",
  required: ["name", "description", "image", "properties"],
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    image: { type: "string", format: "uri" },
    properties: { type: "object" },
  },
};

/**
 * Default values for the metadata service
 */
const DEFAULT_CONFIG: Required<MetadataServiceConfig> = {
  defaultImageUrl:
    "ipfs://bafkreihhxcbeaugnqkoxvhcgk4ri3snyavj3jbsgex7kfgwpthbar7v7mq",
  baseExternalUrl: "https://app.loanchain.example/loans/",
  schemaVersion: "1.0.0",
};

/**
 * Service for creating and validating loan metadata
 */
export class MetadataService {
  private config: Required<MetadataServiceConfig>;
  private ajv: any; // Use any type to avoid Ajv namespace errors

  /**
   * Creates a new metadata service
   * @param config Configuration for the metadata service
   */
  constructor(config?: MetadataServiceConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Initialize AJV validator - fix the initialization to use default import properly
    this.ajv = new (Ajv as any)({ allErrors: true });
    // Call addFormats as a function with the ajv instance
    (addFormats as any)(this.ajv);
    this.ajv.compile(metadataSchema);
  }

  /**
   * Creates a complete NFT metadata object from loan data
   * @param loanData The loan data to create metadata from
   * @param options Options for creating the metadata
   * @returns The complete NFT metadata
   */
  public createMetadata(
    loanData: EnhancedLoanData,
    options: CreateMetadataOptions = {},
  ): NFTMetadata {
    const { includeAttributes = true, generateId = true } = options;

    // Generate an ID if not provided and requested
    const id = loanData.id ? String(loanData.id) : generateId ? uuidv4() : "";

    // Ensure required fields
    const timestamp = loanData.timestamp || Date.now();
    const issuer =
      loanData.issuer || "0x0000000000000000000000000000000000000000";

    // Create the loan metadata
    const loanMetadata: LoanMetadata = {
      ...loanData,
      id,
      issuer,
      timestamp,
      schemaVersion: this.config.schemaVersion,
      status: ((loanData as any).status as LoanStatus) || LoanStatus.Active, // Type assertion to avoid property error
    };

    // Create the NFT metadata
    const nftMetadata: NFTMetadata = {
      name: `Loan Token #${id}`,
      description:
        loanData.aiSummary ||
        `Loan for ${loanData.purpose || "general purposes"}.`,
      image: this.config.defaultImageUrl,
      external_url: `${this.config.baseExternalUrl}${id}`,
      properties: loanMetadata,
    };

    // Add attributes if requested
    if (includeAttributes) {
      nftMetadata.attributes = this.generateAttributes(loanMetadata);
    }

    return nftMetadata;
  }

  /**
   * Validates NFT metadata against the JSON schema
   * @param metadata The metadata to validate
   * @returns Validation result
   */
  public validateMetadata(metadata: NFTMetadata): ValidationResult {
    const validate = this.ajv.compile(metadataSchema);
    const valid = validate(metadata);

    return {
      valid: !!valid,
      errors: validate.errors || undefined,
    };
  }

  /**
   * Performs runtime validation of metadata using Zod
   * @param metadata The metadata to validate
   * @returns Validation result with parsed data if valid
   */
  public validateWithZod(metadata: any): ValidationResult {
    try {
      nftMetadataSchema.parse(metadata);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        errors: error instanceof Error ? [error] : ["Unknown validation error"],
      };
    }
  }

  /**
   * Validates loan metadata against the Zod schema
   * @param metadata The loan metadata to validate
   * @returns Validation result with parsed data if valid
   */
  public validateLoanMetadata(metadata: any): ValidationResult {
    try {
      loanMetadataSchema.parse(metadata);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        errors: error instanceof Error ? [error] : ["Unknown validation error"],
      };
    }
  }

  /**
   * Updates an existing metadata object with new loan data
   * @param existingMetadata The existing metadata to update
   * @param newData The new loan data to apply
   * @returns The updated metadata
   */
  public updateMetadata(
    existingMetadata: NFTMetadata,
    newData: Partial<LoanMetadata>,
  ): NFTMetadata {
    const updatedProperties = {
      ...existingMetadata.properties,
      ...newData,
      timestamp: Date.now(), // Update timestamp
    };

    const updatedMetadata: NFTMetadata = {
      ...existingMetadata,
      properties: updatedProperties,
    };

    // Update description if AI summary changed
    if (newData.aiSummary) {
      updatedMetadata.description = newData.aiSummary;
    }

    // Update attributes if included
    if (existingMetadata.attributes) {
      updatedMetadata.attributes = this.generateAttributes(updatedProperties);
    }

    return updatedMetadata;
  }

  /**
   * Generates marketplace-compatible attributes from loan metadata
   * @param metadata The loan metadata
   * @returns Array of NFT attributes
   */
  private generateAttributes(metadata: LoanMetadata): NFTAttribute[] {
    const attributes: NFTAttribute[] = [
      {
        trait_type: "Amount",
        value: metadata.amount,
        display_type: "number",
      },
      {
        trait_type: "Interest Rate",
        value: metadata.interestRate,
        display_type: "number",
      },
      {
        trait_type: "Term",
        value: metadata.term,
        display_type: "number",
      },
      {
        trait_type: "Purpose",
        value: metadata.purpose || "General",
      },
    ];

    // Add risk tag if available
    if (metadata.riskTag) {
      attributes.push({
        trait_type: "Risk",
        value: metadata.riskTag,
      });
    }

    // Add loan status if available
    if (metadata.status) {
      attributes.push({
        trait_type: "Status",
        value: metadata.status,
      });
    }

    // Add due date if available
    if (metadata.dueDate) {
      attributes.push({
        trait_type: "Due Date",
        value: metadata.dueDate,
        display_type: "date",
      });
    }

    // Add credit score if available
    if (metadata.borrowerDetails?.creditScore) {
      attributes.push({
        trait_type: "Credit Score",
        value: metadata.borrowerDetails.creditScore,
        display_type: "number",
      });
    }

    return attributes;
  }
}
