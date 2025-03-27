import { EnhancedLoanData } from "@loanchain/storage";

/**
 * Enum representing the possible loan statuses
 */
export enum LoanStatus {
  Active = "Active",
  Repaid = "Repaid",
  Defaulted = "Defaulted",
  Liquidated = "Liquidated",
  Cancelled = "Cancelled",
}

/**
 * Extended loan data including additional fields for complete metadata
 */
export interface LoanMetadata extends EnhancedLoanData {
  /**
   * Unique identifier for the loan token
   */
  id: string;

  /**
   * Issuer of the loan (wallet address)
   */
  issuer: string;

  /**
   * ISO timestamp when the metadata was created
   */
  timestamp: number;

  /**
   * URL to the loan terms document on IPFS
   */
  loanTermsDocumentUrl?: string;

  /**
   * Current status of the loan
   */
  status?: LoanStatus;

  /**
   * Due date of the loan in ISO format
   */
  dueDate?: number;

  /**
   * Token URI where this metadata is stored
   */
  metadataUri?: string;

  /**
   * Blockchain transaction ID of the mint transaction
   */
  mintTransactionId?: string;

  /**
   * Block number when the token was minted
   */
  mintBlockNumber?: number;

  /**
   * Tags for categorization
   */
  tags?: string[];

  /**
   * Version of the metadata schema
   */
  schemaVersion: string;
}

/**
 * NFT metadata structure that conforms to standards
 */
export interface NFTMetadata {
  /**
   * Name of the NFT (typically includes ID)
   */
  name: string;

  /**
   * Description of the NFT (typically the AI summary)
   */
  description: string;

  /**
   * URL to the image for the NFT
   */
  image: string;

  /**
   * URL to an external website for the NFT
   */
  external_url?: string;

  /**
   * Animation URL if applicable
   */
  animation_url?: string;

  /**
   * Additional attributes for display in marketplaces
   */
  attributes?: NFTAttribute[];

  /**
   * All loan-specific properties
   */
  properties: LoanMetadata;
}

/**
 * Attribute for NFT metadata in marketplace standard format
 */
export interface NFTAttribute {
  /**
   * Trait type (category)
   */
  trait_type: string;

  /**
   * Value of the trait
   */
  value: string | number;

  /**
   * Optional display type for numerical values
   */
  display_type?: "number" | "date" | "boost_percentage" | "boost_number";
}

/**
 * Configuration for the metadata service
 */
export interface MetadataServiceConfig {
  /**
   * Default image URL for loan tokens
   */
  defaultImageUrl?: string;

  /**
   * Base external URL for loan tokens
   */
  baseExternalUrl?: string;

  /**
   * Current schema version
   */
  schemaVersion?: string;
}

/**
 * Options for creating metadata
 */
export interface CreateMetadataOptions {
  /**
   * Include specific additional attributes
   */
  includeAttributes?: boolean;

  /**
   * Generate a new ID if not provided
   */
  generateId?: boolean;
}

/**
 * Result of metadata validation
 */
export interface ValidationResult {
  /**
   * Whether the validation passed
   */
  valid: boolean;

  /**
   * Any validation errors
   */
  errors?: any[];
}
