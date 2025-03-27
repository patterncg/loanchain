# LoanChain Metadata Service

This package provides tools for creating, validating, and managing metadata for loan tokens in the LoanChain platform.

## Features

- Create standardized NFT metadata for loan tokens
- Validate metadata against JSON schema and Zod schemas
- Generate marketplace-compatible attributes
- Update existing metadata with new information
- Format and sanitize metadata fields
- Assess loan risk based on loan data

## Installation

```bash
pnpm add @loanchain/metadata
```

## Usage

### Creating Metadata

```typescript
import { MetadataService } from "@loanchain/metadata";
import { EnhancedLoanData } from "@loanchain/storage";

// Initialize the metadata service
const metadataService = new MetadataService({
  baseExternalUrl: "https://app.loanchain.example/loans/",
  schemaVersion: "1.0.0",
});

// Create loan data
const loanData: EnhancedLoanData = {
  amount: 10000,
  interestRate: 5.5,
  term: 36,
  collateralType: "Real Estate",
  collateralValue: 250000,
  purpose: "Home Improvement",
  borrowerDetails: {
    name: "Jane Smith",
    creditScore: 780,
  },
  aiSummary: "This is a low-risk loan for home improvements.",
  riskTag: "Low Risk",
  issuer: "0x1234567890123456789012345678901234567890",
};

// Create metadata
const metadata = metadataService.createMetadata(loanData, {
  includeAttributes: true,
  generateId: true,
});

console.log("Metadata:", metadata);
```

### Validating Metadata

```typescript
import { MetadataService } from "@loanchain/metadata";

const metadataService = new MetadataService();

// Validate using JSON Schema
const result = metadataService.validateMetadata(metadata);
if (result.valid) {
  console.log("Metadata is valid!");
} else {
  console.error("Validation errors:", result.errors);
}

// Validate using Zod schema
const zodResult = metadataService.validateWithZod(metadata);
if (zodResult.valid) {
  console.log("Metadata is valid according to Zod schema!");
} else {
  console.error("Zod validation errors:", zodResult.errors);
}
```

### Updating Metadata

```typescript
import { MetadataService } from "@loanchain/metadata";

const metadataService = new MetadataService();

// Update existing metadata
const updatedMetadata = metadataService.updateMetadata(existingMetadata, {
  status: "Repaid",
  mintTransactionId:
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  mintBlockNumber: 12345678,
});

console.log("Updated metadata:", updatedMetadata);
```

### Utility Functions

```typescript
import {
  formatAmount,
  formatInterestRate,
  formatTerm,
  createLoanSummary,
  assessRisk,
} from "@loanchain/metadata";

// Format loan data for display
console.log("Amount:", formatAmount(10000)); // $10,000.00
console.log("Interest Rate:", formatInterestRate(5.5)); // 5.50%
console.log("Term:", formatTerm(36)); // 36 months

// Create a summary
const summary = createLoanSummary("Home Improvement", 10000, 36, "Real Estate");
console.log("Summary:", summary);
// $10,000.00 loan for Home Improvement over 36 months with Real Estate as collateral.

// Assess risk
const risk = assessRisk(10000, 250000, 36, 780);
console.log("Risk:", risk); // Very Low Risk
```

## Configuration

The metadata service can be configured with the following options:

```typescript
const metadataService = new MetadataService({
  // Default image URL for loan tokens
  defaultImageUrl: "ipfs://your-default-image-cid",

  // Base external URL for viewing loans
  baseExternalUrl: "https://app.loanchain.example/loans/",

  // Version of the metadata schema
  schemaVersion: "1.0.0",
});
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Validate schema
pnpm validate
```

## License

MIT
