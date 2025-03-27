# LoanChain IPFS Storage Service

This package provides an IPFS storage service for the LoanChain platform using NFT.Storage.

## Features

- Upload loan metadata to IPFS using NFT.Storage
- Upload files to IPFS with automatic content type detection
- Upload JSON data to IPFS
- Status checking for IPFS service

## Installation

```bash
pnpm add @loanchain/storage
```

## Usage

### Initializing the service

```typescript
import { IPFSService } from '@loanchain/storage';

// Create a new instance of the IPFS service
const ipfsService = new IPFSService({
  token: process.env.NFT_STORAGE_KEY,
  defaultImagePath: 'ipfs://your-default-image-cid' // Optional
});
```

### Uploading loan metadata

```typescript
import { EnhancedLoanData } from '@loanchain/storage';

const loanData: EnhancedLoanData = {
  amount: 1000,
  interestRate: 5,
  term: 12,
  collateralType: 'Real Estate',
  collateralValue: 50000,
  purpose: 'Home Renovation',
  aiSummary: 'This is a low-risk loan for home renovation.',
  riskTag: 'Low Risk'
};

const result = await ipfsService.uploadMetadata(loanData);
console.log('Metadata URL:', result.url);
console.log('IPFS CID:', result.cid);
```

### Uploading a file

```typescript
import { readFileSync } from 'fs';

// Upload a file from disk
const fileData = readFileSync('path/to/file.jpg');
const result = await ipfsService.uploadFile(fileData, {
  fileName: 'image.jpg',
  contentType: 'image/jpeg'
});

console.log('File URL:', result.url);
```

### Uploading JSON data

```typescript
const jsonData = {
  key1: 'value1',
  key2: 'value2',
  nested: {
    key3: 'value3'
  }
};

const result = await ipfsService.uploadJSON(jsonData);
console.log('JSON URL:', result.url);
```

### Checking service status

```typescript
const isOperational = await ipfsService.checkStatus();
if (isOperational) {
  console.log('IPFS service is operational');
} else {
  console.log('IPFS service is not operational');
}
```

## Configuration

The IPFS service requires an NFT.Storage API token. You can get one by signing up at [nft.storage](https://nft.storage/).

## Environment Variables

```
NFT_STORAGE_KEY=your-nft-storage-api-key
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test
```

## License

MIT 